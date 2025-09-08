import { NextRequest, NextResponse } from 'next/server';
import { ChatOpenAI } from '@langchain/openai';
import { ChatCohere } from '@langchain/cohere';
import { PromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { RunnableSequence, RunnablePassthrough } from '@langchain/core/runnables'; 
import { formatDocumentsAsString } from 'langchain/util/document';
import { getRetriever } from '../upload/route'; 

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-api-secret');
  if (secret !== process.env.API_SECRET_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { question } = await req.json();

    if (!question) {
      return NextResponse.json({ error: 'Question is required' }, { status: 400 });
    }

    const retriever = await getRetriever();
    if (!retriever) {
        return NextResponse.json({ error: 'PDF not processed yet. Please upload a PDF first.' }, { status: 400 });
    }
    
    const promptTemplate = `
      You are an assistant for question-answering tasks.
      Use the following pieces of retrieved context to answer the question.
      If you don't know the answer, just say that you don't know.
      Use three sentences maximum and keep the answer concise.
      
      Context: {context}
      
      Question: {question}
      
      Answer:
    `;
    const prompt = PromptTemplate.fromTemplate(promptTemplate);
    

    // Use ChAT-GPT or Cohere as the LLM
    
    // Using OpenAI's GPT-3.5-Turbo
    // const llm = new ChatOpenAI({ modelName: 'gpt-3.5-turbo', temperature: 0 });

    // Using Cohere Command model
    const llm = new ChatCohere({
      apiKey: process.env.COHERE_API_KEY,
      model: "command",
      temperature: 0,
    });

    const ragChain = RunnableSequence.from([
      {
        context: retriever.pipe(formatDocumentsAsString),
        question: new RunnablePassthrough(), 
      },
      prompt,
      llm,
      new StringOutputParser(),
    ]);

    const answer = await ragChain.invoke(question);

    return NextResponse.json({ answer });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}
