import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { DEFAULT_USER_ID } from "../src/lib/constants";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("缺少环境变量 DATABASE_URL");
}
const prisma = new PrismaClient({ adapter: new PrismaBetterSqlite3({ url: databaseUrl }) });

const ACCOUNTS = [
  { key: "cash", name: "现金", type: "CASH" },
  { key: "debit", name: "招行储蓄卡", type: "DEBIT" },
  { key: "credit", name: "信用卡", type: "CREDIT" },
];

const CATEGORIES: { kind: string; names: string[] }[] = [
  { kind: "EXPENSE", names: ["餐饮", "交通", "购物", "居住", "娱乐", "医疗", "其他"] },
  { kind: "INCOME", names: ["工资", "奖金", "投资收益", "其他"] },
];

async function main() {
  await prisma.user.upsert({
    where: { id: DEFAULT_USER_ID },
    update: {},
    create: { id: DEFAULT_USER_ID, name: "我" },
  });

  for (const account of ACCOUNTS) {
    const id = `seed-account-${account.key}`;
    await prisma.account.upsert({
      where: { id },
      update: {},
      create: { id, userId: DEFAULT_USER_ID, name: account.name, type: account.type },
    });
  }

  for (const group of CATEGORIES) {
    for (const [index, name] of group.names.entries()) {
      const id = `seed-category-${group.kind}-${index}`;
      await prisma.category.upsert({
        where: { id },
        update: {},
        create: { id, userId: DEFAULT_USER_ID, name, kind: group.kind },
      });
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });