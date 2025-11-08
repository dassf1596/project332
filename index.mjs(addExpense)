// index.mjs ของ addExpense
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, QueryCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";
import { randomUUID } from "crypto";

const dbClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dbClient);
const snsClient = new SNSClient({});

const EXPENSES_TABLE_NAME = "Expenses";
const BUDGET_TABLE_NAME = "Budget";
// !!! แก้ไข SNS_TOPIC_ARN เป็นของคุณ !!!
const SNS_TOPIC_ARN = "arn:aws:sns:REGION:ACCOUNT_ID:ExpenseAlerts";

export const handler = async (event) => {
  let responseBody = {};
  let statusCode = 200;
  const userId = "my_user";
  const today = new Date().toISOString().split("T")[0];

  try {
    // 1. บันทึกรายจ่าย
    const body = JSON.parse(event.body);
    const { amount, category } = body;
    if (!amount || !category) throw new Error("ข้อมูล 'amount' หรือ 'category' หายไป");
    const expenseId = randomUUID();
    const dateExpenseId = `${today}#${expenseId}`;

    await docClient.send(new PutCommand({
      TableName: EXPENSES_TABLE_NAME,
      Item: { user_id: userId, date_expense_id: dateExpenseId, amount: amount, category: category, createdAt: new Date().toISOString() },
    }));
    responseBody = { message: "บันทึกรายจ่ายสำเร็จ!", expenseId: expenseId };

    // 2. เช็กยอดทันที
    const budgetParams = { TableName: BUDGET_TABLE_NAME, Key: { user_id: userId } };
    const expensesParams = {
      TableName: EXPENSES_TABLE_NAME,
      KeyConditionExpression: "user_id = :uid AND begins_with(date_expense_id, :today)",
      ExpressionAttributeValues: { ":uid": userId, ":today": today }
    };
    const [budgetData, expensesData] = await Promise.all([
      docClient.send(new GetCommand(budgetParams)),
      docClient.send(new QueryCommand(expensesParams))
    ]);

    if (budgetData.Item && budgetData.Item.daily_limit) {
      const dailyLimit = budgetData.Item.daily_limit;
      let totalSpent = 0;
      if (expensesData.Items) {
        for (const item of expensesData.Items) {
          totalSpent += item.amount;
        }
      }

      if (totalSpent > dailyLimit) {
        // สร้าง List รายการ
        let itemsListString = "";
        if (expensesData.Items) {
          itemsListString = expensesData.Items.map(item => `  - ${item.category}: ${item.amount} บาท`).join("\n");
        }
        
        const message = `แจ้งเตือน! 🚨\n\nยอดใช้จ่ายของคุณวันนี้ (${today}) คือ ${totalSpent} บาท\nซึ่งเกินงบประมาณที่ตั้งไว้ ${dailyLimit} บาทแล้วครับ\n\nรายการทั้งหมดในวันนี้:\n${itemsListString}\n\n-- ระบบเตือนตัง (Real-time) --`;
        
        await snsClient.send(new PublishCommand({ Message: message, Subject: `💸 เตือนตัง: วันนี้ใช้เงินเกินงบ!`, TopicArn: SNS_TOPIC_ARN }));
        responseBody.alertSent = true;
      }
    }
  } catch (error) {
    statusCode = 400;
    responseBody = { message: error.message };
  }

  // 3. ตอบกลับหน้าเว็บ (พร้อม CORS)
  return {
    statusCode: statusCode,
    body: JSON.stringify(responseBody),
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
    },
  };
};
