import prisma from "@/lib/prisma";

export class DbClient {
  static async init() {
    await prisma.$connect();
  }

  static async queryBalance(apiKey: string) {
    await this.init();
    return await prisma.balance.findFirst({
      where: {
        account_key: apiKey,
        disabled: false,
      },
    });
  }

  static async useBalance(apiKey: string, num: number) {
    await this.init();
    const balance = await this.queryBalance(apiKey);
    if (!balance) {
      throw new Error("Invalid token");
    }
    await prisma.balance.update({
      where: {
        id: balance.id,
      },
      data: {
        used: {
          increment: num,
        },
      },
    });
  }
}
