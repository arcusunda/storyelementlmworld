// utils/promptUtils.ts
import { ObjectId } from 'mongodb';
import { getCollection } from './mongodb';

interface PromptDocument {
  _id?: unknown;
  type: string;
  version: string;
  active: boolean;
  name: string;
  systemContext: string;
  contentTemplate: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Gets the active prompt for a specific type
 * @param promptType Type of the prompt to retrieve
 * @returns The active prompt or null if none exists
 */
export async function getActivePrompt(promptType: string): Promise<PromptDocument | null> {
  const collection = await getCollection('prompts');
  return collection.findOne({
    type: promptType,
    active: true
  }) as Promise<PromptDocument | null>;
}

export async function createPromptVersion(
  promptType: string,
  name: string,
  systemContext: string,
  contentTemplate: string,
  setActive: boolean = false
): Promise<string> {
  const collection = await getCollection('prompts');
  
  const latestPrompt = await collection.findOne(
    { type: promptType },
    { sort: { version: -1 } }
  ) as PromptDocument | null;
  
  const currentVersion = latestPrompt ? parseFloat(latestPrompt.version) : 0;
  const newVersion = (currentVersion + 0.1).toFixed(1);
  
  if (setActive) {
    await collection.updateMany(
      { type: promptType },
      { $set: { active: false } }
    );
  }
  
  const result = await collection.insertOne({
    type: promptType,
    version: newVersion,
    active: setActive,
    name,
    systemContext,
    contentTemplate,
    createdAt: new Date(),
    updatedAt: new Date()
  });
  
  return result.insertedId.toString();
}

export async function setPromptActive(promptId: string): Promise<boolean> {
  const collection = await getCollection('prompts');
  
  const prompt = await collection.findOne({ _id: new ObjectId(promptId) }) as PromptDocument | null;
  if (!prompt) return false;
  
  await collection.updateMany(
    { type: prompt.type },
    { $set: { active: false } }
  );
  
  await collection.updateOne(
    { _id: new ObjectId(promptId) },
    { $set: { active: true, updatedAt: new Date() } }
  );
  
  return true;
}

export async function updatePrompt(
  promptId: string,
  updateData: Partial<Pick<PromptDocument, 'name' | 'systemContext' | 'contentTemplate'>>
): Promise<boolean> {
  const collection = await getCollection('prompts');
  
  const update: Partial<PromptDocument> = {
    ...updateData,
    updatedAt: new Date()
  };
  
  const result = await collection.updateOne(
    { _id: new ObjectId(promptId) },
    { $set: update }
  );
  
  return result.modifiedCount > 0;
}