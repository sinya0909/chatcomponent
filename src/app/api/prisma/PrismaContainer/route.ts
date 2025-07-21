import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
	const userArray = await prisma.user.findMany({
		include: {
			messages: true,
			ChatRoom: true,
		},
	});

	// Response を jsonで返す
	return NextResponse.json(userArray);
}

export async function POST(req: NextRequest) {
	// リクエストボディ
	const { id, name, email } = await req.json();

	const res = await prisma.user.create({
		data: {
			id: String(id),
			name: String(name),
			email: String(email),
		},
	});

	return NextResponse.json(res);
}