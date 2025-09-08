import { NextRequest, NextResponse } from 'next/server';
import { OpenAIEmbeddings } from '@langchain/openai';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { CohereEmbeddings } from '@langchain/cohere';

let vectorStore: MemoryVectorStore | null = null;

const createEmbeddingsCohere = () => {
  const apiKey = process.env.COHERE_API_KEY;
  if (!apiKey) {
      throw new Error("COHERE_API_KEY became undefined before creating embeddings instance.");
  }
  return new CohereEmbeddings({
    apiKey: apiKey,
    model: 'embed-english-v3.0' 
  });
};

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-api-secret');
  if (secret !== process.env.API_SECRET_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await req.formData();
    const file = data.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ success: false, error: 'No file uploaded' }, { status: 400 });
    }

    const loader = new PDFLoader(file);
    const pageLevelDocs = await loader.load();

    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });
    const docs = await textSplitter.splitDocuments(pageLevelDocs);

    const embeddings = createEmbeddingsCohere();

    // OR ELSE USE OpenAIEmbeddings like below

    // const embeddings = new OpenAIEmbeddings({
    //   modelName: "text-embedding-3-small",
    // });

    vectorStore = await MemoryVectorStore.fromDocuments(docs, embeddings);

    console.log('PDF processed and embeddings stored.');
    return NextResponse.json({ success: true, message: 'PDF processed successfully' });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}

export const getRetriever = async () => {
    if (!vectorStore) {
        return null; 
    }
    return vectorStore.asRetriever();
};
