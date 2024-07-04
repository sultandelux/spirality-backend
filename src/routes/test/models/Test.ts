import mongoose, { Document, Schema } from 'mongoose';

export interface ITestQuestion {
  question: string;
  answers: string[];
  correct_answer: string;
}

export interface ITest extends Document {
  name: string;
  description: string;
  test: ITestQuestion[];
  image?: string;
}

const TestQuestionSchema = new Schema<ITestQuestion>({
  question: { type: String, required: true },
  answers: { type: [String], required: true },
  correct_answer: { type: String, required: true },
});

const TestSchema = new Schema<ITest>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  test: { type: [TestQuestionSchema], required: true },
  image: { type: String },
});

const TestModel = mongoose.model<ITest>('Test', TestSchema);

export default TestModel;
