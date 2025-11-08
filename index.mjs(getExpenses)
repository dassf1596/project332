// index.mjs ของ getExpenses
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";

const dbClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dbClient);
const TABLE_NAME = "Expenses";

export const handler = async (event) => {
  const userId = "my_user";
  const today = new Date().toISOString().split("T")[0];
  try {
    const expensesParams = {
      TableName: TABLE_NAME,
      KeyConditionExpression: "user_id = :uid AND begins_with(date_expense_id, :today)",
      ExpressionAttributeValues: { ":uid": userId, ":today": today }
    };
    const data = await docClient.send(new QueryCommand(expensesParams));
    return {
      statusCode: 200,
      body: JSON.stringify(data.Items || []),
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
    };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ message: error.message }), headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }};
  }
};
