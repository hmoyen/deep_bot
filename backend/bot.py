import re
from fastapi import FastAPI
from pydantic import BaseModel
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import PyMuPDFLoader
from langchain_community.embeddings import OllamaEmbeddings
from chromadb.config import Settings
from langchain_community.llms import Ollama
from chromadb import Client
from langchain_community.vectorstores import Chroma
from fastapi.middleware.cors import CORSMiddleware

# Initialize FastAPI
app = FastAPI()

# Enable CORS (allows frontend requests)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Change this to your frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Chroma client
client = Client(Settings())

# Check if collection exists
collection_name = "foundations_of_llms"
existing_collections = [c.name for c in client.list_collections()]

if collection_name in existing_collections:
    print(f"✅ Found existing collection: {collection_name}")
    collection = client.get_collection(name=collection_name)
else:
    print(f"🚀 No existing collection found. Creating embeddings...")

    # Load the document
    loader = PyMuPDFLoader("troubleshooting_wheel_loader-3.pdf")
    documents = loader.load()

    # Split the document into smaller chunks
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    chunks = text_splitter.split_documents(documents)

    # Initialize Ollama embeddings
    embedding_function = OllamaEmbeddings(model="deepseek-r1")

    # Generate embeddings
    embeddings = [embedding_function.embed_query(chunk.page_content) for chunk in chunks]

    # Create collection and store embeddings
    collection = client.create_collection(name=collection_name)

    for idx, chunk in enumerate(chunks):
        collection.add(
            documents=[chunk.page_content], 
            metadatas=[{'id': idx}], 
            embeddings=[embeddings[idx]], 
            ids=[str(idx)]
        )
    print("✅ Embeddings stored in ChromaDB.")

# Initialize retriever
retriever = Chroma(collection_name=collection_name, client=client, embedding_function=OllamaEmbeddings(model="deepseek-r1")).as_retriever()

# Initialize LLM for answering questions
llm = Ollama(model="deepseek-r1")

def retrieve_context(question):
    """Retrieve relevant context from stored embeddings."""
    results = retriever.invoke(question)
    context = "\n\n".join([doc.page_content for doc in results])
    return context

def query_deepseek(question, context):
    """Use DeepSeek-R1 to generate an answer."""
    formatted_prompt = f"Question: {question}\n\nContext: {context}"
    
    # Generate response
    response = llm.invoke(formatted_prompt)

    # Clean response
    final_answer = re.sub(r'<think>.*?</think>', '', response, flags=re.DOTALL).strip()
    return final_answer

def ask_question(question):
    """Retrieve context and answer the question."""
    context = retrieve_context(question)
    answer = query_deepseek(question, context)
    return answer


# Define API request model
class QuestionRequest(BaseModel):
    question: str

@app.post("/api/predict")
async def predict(request: QuestionRequest):
    """API endpoint to handle questions from the frontend."""
    answer = ask_question(request.question)
    return {"answer": answer}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=7770)
