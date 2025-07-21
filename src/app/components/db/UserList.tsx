export default async function UserList() {
	// APIのURL - 環境変数から取得、なければデフォルト値を使用
	const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
	const url = `${baseUrl}/api/prisma/PrismaContainer`;
	// APIへリクエスト
	const res = await fetch(url, {
		cache: "no-store",
	});
	
	// エラーハンドリング
	if (!res.ok) {
		console.error(`API Error: ${res.status} ${res.statusText}`);
		console.error(`URL: ${url}`);
		const text = await res.text();
		console.error(`Response: ${text}`);
		throw new Error(`Failed to fetch data: ${res.status}`);
	}
	
	// レスポンスボディを取り出す
	const data = await res.json();

	type User = {
		name: string;
		email: string;
		posts: { title: string }[];
		profile?: { bio: string };
	};

	return (
		<div>
		<h2>All Users</h2>
		{data.map((User: User, index: number) => (
			<div key={index}>
				Name: {User.name} Email: {User.email} ;
			</div>
		))}
		</div>
	);
}
