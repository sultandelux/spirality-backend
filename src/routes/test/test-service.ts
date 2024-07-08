import TestModel, { ITest } from './models/Test';
import { uploadFile } from '../../middlewares/s3-middleware';
import openai from '../../openai';

class TestService {
  private async *processStreamedJsonArray(
    stream: AsyncIterable<any>
  ): AsyncGenerator<any> {
    let accumulator = '';
    let depth = 0;
    let isInString = false;

    for await (const part of stream) {
      const chunk = part.choices[0]?.delta?.content;

      if (chunk) {
        for (const char of chunk) {
          if (char === '"' && (accumulator.slice(-1) !== '\\' || isInString)) {
            isInString = !isInString;
          }

          if (isInString || depth > 0) {
            accumulator += char;
          }

          if (!isInString) {
            if (char === '{') {
              depth++;
              if (depth === 1) {
                accumulator = '{';
              }
            } else if (char === '}') {
              depth--;
            }
          }

          if (depth === 0 && !isInString && accumulator.trim() !== '') {
            try {
              const parsedObject = JSON.parse(accumulator);
              yield parsedObject;
            } catch (e) {
              console.error('Error parsing JSON:', e);
            }
            accumulator = '';
          }
        }
      }
    }
  }

  async createTest(
    test: Partial<ITest>,
    imageBuffer: Buffer,
    imageFileName: string
  ): Promise<ITest> {
    try {
      const bucketName = process.env.AWS_BUCKET_NAME!;
      const imageKey = `test-images/${Date.now().toString()}-${imageFileName}`;

      console.log('Uploading image file to S3:', { bucketName, imageKey });
      const imageUrl = await uploadFile(bucketName, imageBuffer, imageKey);
      console.log('Image file uploaded to S3:', imageUrl);

      const base64Image = imageBuffer.toString('base64');
      const userPrompt = `Мне нравится аниме One Piece и игра бравл старс`;

      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `
             Как учитель, ваша задача состоит в том, чтобы создавать интересные и образовательные материалы для ваших учеников, учитывая их личные интересы. В этом случае вам нужно разработать курс, который соответствует интересам каждого ученика.
              тебе скидывают фото и ты должен делать вопросы используя данные для обучения только из этого фото то есть если в книге нету инфомации допустим о Петре 1, значит и в аутпуте не должна быть инфа о петре первым
              он должен охватывать все темы и не терять ни одну из них!!
              Для каждой темы вам нужно подготовить следующее:

              1. Тема урока: Название темы, которую вы будете изучать.
              2. Конспект: Полный и подробный обзор материала, который ученик должен изучить. Этот конспект должен включать ВСЕ аспекты темы кроме сильной ВОДЫ, примеры и объяснения добавляя отсылки к его любимым темам.
              3. Тесты к уроку: Набор вопросов и ответов, который поможет ученикам проверить свои знания после изучения материала. Каждый тест должен охватывать основные пункты, изученные в конспекте.

              Например:
              - Тема урока: Японская культура через аниме
                - Конспект: В этом уроке мы рассмотрим основные аспекты японской культуры, как представленные в аниме. Будут рассмотрены темы, такие как японские праздники, традиции, история и влияние на современное общество. Предоставлены примеры популярных аниме и их культурные отсылки.
                - Тесты к уроку:
                  - Вопрос: Какие основные аспекты японской культуры рассматриваются в аниме?
                    Ответы: Японские праздники и традиции, История и влияние на современное общество, Примеры популярных аниме и их культурные отсылки, Все вышеперечисленное.

              ДЕЛАЙ КАК МИНИМУМ 5-6 ТЕСТОВЫХ ВОПРОСОВ, ЕСЛИ ТЕКСТ БОЛЬШОЙ ТО ДЕЛАЙ ИХ БОЛЬШЕ 10, ВОПРОСЫ ДОЛЖНЫ БРАТЬСЯ ТОЛЬКО С ТЕКСТА КНИГИ 

              ТЫ ДОЛЖЕН ИСПОЛЬЗОВАТЬ ДАННЫЕ ИЗ ФОТО КОТОРОЕ ТЕБЕ ОТПРАВИЛИ И К ЭТИМ ДАННЫМ ИЗ ФОТО ДОБАВЛЯТЬ К КОНСПЕКТАМ  ПРИМЕРЫ ИЗ ИНТЕРЕСОВ ЮЗЕРА, РАЗДЕЛЯЙ КОНСПЕКТ АЗБАЦАМИ ЧТОБЫ ЮЗЕРУ БЫЛО ЛЕГКО ЧИТАТЬ ЕГО ДОАВБЛЯЙ в НУЖНЫХ МЕСТАХ ЧТОБЫ ЮЗЕРУ БЫЛО КОМОФОРТНО ЧИТАТЬ
              верни мне данные в таком виде c валидным джсон файлом!!:
              {
                "course_structure": {
                  "head_name": "степени",
                  "topics": [
                    {
                      "topic": "Степень с натуральным показателем",
                      "conspect": "В этом уроке мы рассмотрим степень с натуральным показателем. Степень — это способ записи произведения нескольких одинаковых множителей. Допустим, Наруто может создавать свои копии. Если число а умножить на себя n раз, то это можно записать как а^n, и это будет как концентрация нескольких рассенганов. Число а называется основанием степени, а число n — показателем степени. Например, (−1,1)^21 = (−1,1) * (−1,1) * ... * (−1,1) = Q. Такие выражения удобно использовать для упрощения записи больших произведений. При чтении сначала читают основание, затем показатель. Например, a^n читается как 'а в степени n'.",
                      "tests": [
                        {
                          "question": "Что такое степень с натуральным показателем?",
                          "answers": [
                            "Произведение нескольких различных чисел",
                            "Произведение нескольких одинаковых множителей",
                            "Сумма нескольких одинаковых чисел",
                            "Деление нескольких чисел"
                          ],
                          "correct_answer": "Произведение нескольких одинаковых множителей"
                        },
                        {
                          "question": "Как обозначается число, которое повторяется в произведении в выражении a^n?",
                          "answers": [
                            "Основание степени",
                            "Показатель степени",
                            "Множитель",
                            "Произведение"
                          ],
                          "correct_answer": "Основание степени"
                        },
                        {
                          "question": "Как читается выражение a^n?",
                          "answers": [
                            "Показатель a с числом n",
                            "Основание степени n",
                            "а в степени n",
                            "n в степени a"
                          ],
                          "correct_answer": "а в степени n"
                        }
                      ]
                    }
                  ]
                }
              }
              Это сообщение содержит "json" для поддержки response_format типа json_object.`
          },
          {
            role: 'user',
            content: [
              { type: 'text', text: userPrompt },
              { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${base64Image}` } }
            ]
          }
        ],
        stream: false
      });

      let messageContent = response.choices[0]?.message?.content || null;
      console.log('Received message content:', messageContent);

      if (!messageContent) {
        throw new Error('No content received from OpenAI');
      }

      messageContent = messageContent.replace(/```json|```/g, '').trim();
      console.log("this is message content with trim!!: ", messageContent);
      const testDescriptions = JSON.parse(messageContent);
      console.log("Parsed testDescriptions:", testDescriptions);

      if (!testDescriptions.course_structure || !Array.isArray(testDescriptions.course_structure.topics) || testDescriptions.course_structure.topics.length === 0) {
        throw new Error('Invalid structure in the response from OpenAI');
      }

      const newTest = new TestModel({
        ...test,
        image: imageUrl,
        name: testDescriptions.course_structure.topics[0].topic,
        description: testDescriptions.course_structure.topics[0].conspect,
        test: testDescriptions.course_structure.topics[0].tests
      });

      console.log('Saving test to database:', newTest);
      const savedTest = await newTest.save();

      return savedTest;
    } catch (err) {
      console.error('Error creating test:', err);
      throw err;
    }
  }

  async getTest(id: string): Promise<ITest | null> {
    try {
      return TestModel.findById(id);
    } catch (err) {
      console.error('Error getting test:', err);
      throw err;
    }
  }

  async getAllTests(): Promise<ITest[]> {
    try {
      return TestModel.find();
    } catch (err) {
      console.error('Error getting tests:', err);
      throw err;
    }
  }

  async updateTest(
    id: string,
    testUpdate: Partial<ITest>,
    imageBuffer?: Buffer,
    imageFileName?: string
  ): Promise<ITest | null> {
    try {
      let imageUrl: string | undefined;
      if (imageBuffer && imageFileName) {
        const bucketName = process.env.AWS_BUCKET_NAME!;
        const imageKey = `tests/${Date.now().toString()}-${imageFileName}`;

        console.log('Uploading image file to S3:', { bucketName, imageKey });
        imageUrl = await uploadFile(bucketName, imageBuffer, imageKey);
        console.log('Image file uploaded to S3:', imageUrl);
      }

      const test = await TestModel.findById(id);
      if (!test) throw new Error('Test not found');

      if (imageUrl) {
        testUpdate.image = imageUrl;
      }

      Object.assign(test, testUpdate);
      const updatedTest = await test.save();

      return updatedTest;
    } catch (err) {
      console.error('Error updating test:', err);
      throw err;
    }
  }

  async deleteTest(id: string): Promise<ITest | null> {
    try {
      return TestModel.findByIdAndDelete(id);
    } catch (err) {
      console.error('Error deleting test:', err);
      throw err;
    }
  }
}

export default TestService;
