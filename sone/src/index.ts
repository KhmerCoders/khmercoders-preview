import express, { type Request, type Response } from 'express';
import path from 'node:path';
import { Column, Font, Photo, type SoneImage, Span, Text, TextDefault, sone } from 'sone';

const resolvePath = (p: string) => {
	const r = path.join(process.cwd(), 'assets', p);
	console.log(r);
	return r;
}

const ASSETS_CACHE = new Map<string | Uint8Array, SoneImage>();

Font.load('KantumruyPro', resolvePath('fonts/KantumruyPro.ttf'));
Font.load('Geist Mono', resolvePath('fonts/GeistMono.ttf'));
Font.load('Inter', resolvePath('fonts/Inter.ttf'));

type KhmerCoderAccountProps = {
	photoUrl?: string | null;
	name?: string;
	bio?: string | null;
	position?: string | null;
	username?: string | null;
	followingCount: number;
	follwersCount: number;
};

function KhmerCoderAccount({
	photoUrl,
	name,
	bio,
	position,
	username,
	followingCount,
	follwersCount,
}: KhmerCoderAccountProps) {
	const colors = {
		primary: '#ffcc01',
		bg: 'white',
		text: '#737373',
		border: '#fb923b',
		slate: '#eee',
	};

	return Column(
		TextDefault(
			//
			photoUrl != null
				? Photo(photoUrl)
					.size(172)
					.preserveAspectRatio()
					.rounded(32)
					.borderColor(colors.border)
					.borderWidth(8)
					.cornerSmoothing(0.6)
				: Column()
					.size(172)
					.rounded(32)
					.bg(colors.slate)
					.borderColor('transparent')
					.borderWidth(8)
					.cornerSmoothing(0.6),
			Text(
				name,
				username != null
					? Span(` ${username}`).weight(500).size(32).color(colors.text).font('Geist Mono')
					: null
			)
				.size(44)
				.weight(600)
				.marginTop(14),
			Text(position).size(26).weight(500).color(colors.text),
			Text(
				Span(String(follwersCount)).color('black').weight('bold'),
				Span(' Followers').color(colors.text),
				'  ',
				Span(String(followingCount)).color('black').weight('bold'),
				Span(' Following').color(colors.text)
			).size(22),
			bio != null
				? Text(bio)
					.size(26)
					.weight(500)
					.bg('#f2f2f2')
					.padding(12, 20)
					.rounded(16)
					.color('rgba(60, 60, 60, 1)')
					.cornerSmoothing(0.6)
					.marginTop(4)
				: null
		).font('Inter', 'KantumruyPro'),
		Column().bg(colors.primary).height(32).position('absolute').bottom(0).left(0).right(0),
		Photo(resolvePath('logo.svg'))
			.position('absolute')
			.width(140)
			.right(72)
			.top(72)
			.preserveAspectRatio(),

		Column().width(2).position('absolute').top(0).bottom(32).bg('#eee').left(44),
		Column().height(2).position('absolute').left(0).right(0).top(44).bg('#eee'),
		Column().width(2).position('absolute').top(0).bottom(32).bg('#eee').right(44)
	)
		.size(1200, 630)
		.bg(colors.bg)
		.padding(72)
		.gap(8);
}

const app = express();
const port = 3000;

app.get('/preview/:profile', async (req: Request, res: Response) => {

	try {
		const profile = req.params.profile;
		const response = await fetch(`https://khmercoder.com/api/account/profile/${profile}`);
		if (!response.ok) throw new Error('Profile not found');
		const data = await response.json();

		const root = KhmerCoderAccount({
			photoUrl: data.image,
			name: data.name,
			position: data.position,
			username: data.alias ? `@${data.alias}` : null,
			bio: data.bio,
			followingCount: data.followingCount,
			follwersCount: data.followersCount,
		});

		const buffer = await sone(root, { cache: ASSETS_CACHE }).jpg(0.95);
		res.set('Content-Type', 'image/jpeg').send(Buffer.from(buffer));
	} catch (err) {
		console.log(err);
		res.status(404).send('Profile not found or error fetching profile');
	}
});

app.listen(port, () => {
	console.log(`Server is running on http://localhost:${port}`);
});
