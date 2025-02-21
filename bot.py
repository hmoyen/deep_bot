import re
# import ollama
# from langchain_ollama import OllamaEmbeddings

import gradio as gr
from concurrent.futures import ThreadPoolExecutor
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import PyMuPDFLoader
from langchain_community.embeddings import OllamaEmbeddings
from chromadb.config import Settings
from chromadb import Client
from langchain_community.vectorstores import Chroma

# Load the document using PyMuPDFLoader
loader = PyMuPDFLoader("document-20-24.pdf")
documents = loader.load()

# Split the document into smaller chunks
text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
chunks = text_splitter.split_documents(documents)

# Initialize Ollama embeddings using DeepSeek-R1
embedding_function = OllamaEmbeddings(model="deepseek-r1")

# Parallelize embedding generation
def generate_embedding(chunk):
    return embedding_function.embed_query(chunk.page_content)

with ThreadPoolExecutor() as executor:
    embeddings = list(executor.map(generate_embedding, chunks))

# Initialize Chroma client and create/reset the collection
client = Client(Settings())

# Safe deletion of collection if it exists
try:
    client.delete_collection(name="foundations_of_llms")  # Delete existing collection (if any)
except ValueError as e:
    print(f"Error during deletion: {e}. Continuing with collection creation.")

# Create a new collection
collection = client.create_collection(name="foundations_of_llms")

# Add documents and embeddings to Chroma
for idx, chunk in enumerate(chunks):
    collection.add(
        documents=[chunk.page_content], 
        metadatas=[{'id': idx}], 
        embeddings=[embeddings[idx]], 
        ids=[str(idx)]  # Ensure IDs are strings
    )

# Initialize retriever using Ollama embeddings for queries
retriever = Chroma(collection_name="foundations_of_llms", client=client, embedding_function=embedding_function).as_retriever()

def retrieve_context(question):
    # Retrieve relevant documents
    results = retriever.invoke(question)
    # Combine the retrieved content
    context = "\n\n".join([doc.page_content for doc in results])
    return context

def query_deepseek(question, context):
    # Format the input prompt
    formatted_prompt = f"Question: {question}\n\nContext: {context}"
    
    # Call the Ollama model (adjust this part as needed for the correct response structure)
    # response = embedding_function.embed_query(formatted_prompt)  # Modify if needed for the correct response structure
    response = embedding_function.generate_response(formatted_prompt)  # Replace with the actual function

    # Check if the response is a list and convert all items to strings
    if isinstance(response, list):
        response_content = ' '.join(map(str, response))  # Convert each item to a string
    else:
        response_content = str(response)  # If it's already a string, use it directly
    
    # Clean and return the response
    final_answer = re.sub(r'<think>.*?</think>', '', response_content, flags=re.DOTALL).strip()
    return final_answer


def ask_question(question):
    # Retrieve context and generate an answer using RAG
    context = retrieve_context(question)
    answer = query_deepseek(question, context)
    return answer

# Set up the Gradio interface
interface = gr.Interface(
    fn=ask_question,
    inputs="text",
    outputs="text",
    title="RAG Chatbot: Foundations of LLMs",
    description="Ask any question about the Foundations of LLMs book. Powered by DeepSeek-R1."
)

# Launch the interface
interface.launch()
