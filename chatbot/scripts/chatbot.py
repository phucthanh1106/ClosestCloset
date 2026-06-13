from pinecone import Pinecone
import os
import getpass
from dotenv import load_dotenv
os.environ["KMP_DUPLICATE_LIB_OK"] = "TRUE"

from langchain_community.document_loaders import DirectoryLoader, PyPDFLoader 
from langchain_community.vectorstores import FAISS 
from langchain_community.vectorstores.utils import DistanceStrategy
from langchain_core.prompts import ChatPromptTemplate
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_google_genai import GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI
from pprint import pprint

from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough

# Load variables from the .env file into the environment
load_dotenv()

PIPECONE_API_KEY=os.getenv("PINECONE_API_KEY")
pc = Pinecone(api_key=PIPECONE_API_KEY)
index = pc.Index("quickstart")