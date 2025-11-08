// index.mjs ของ deleteExpense
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, DeleteCommand } from "@aws-sdk/lib-dynamodb";

const dbClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dbClient);
const TABLE_NAME = "Expenses";

export const handler = async (event) => {
  const userId = "my_user";
  try {
    const body = JSON.parse(event.body);
    const { date_expense_id } = body;
    if (!date_expense_id) throw new Error("date_expense_id is required");

    await docClient.send(new DeleteCommand({
      TableName: TABLE_NAME,
      Key: { "user_id": userId, "date_expense_id": date_expense_id }
    }));
    
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Item deleted" }),
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type" }
    };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ message: error.message }), headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }};
  }
};
