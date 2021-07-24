# 🌕MoonTimers API

This is the backend code for [🌕MoonTimers](https://moontimers.com)

### Vercel Serverless Functions

All API calls are deployed as [serverless functions](https://vercel.com/docs/serverless-functions/introduction) on [Vercel](https://vercel.com).

### Prerequisites

[Vercel CLI](https://vercel.com/cli) installed for local development
MongoDB instance and a connection string - [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) offers a free tier plan
The collection names I use for the app are:

- **categories** (the navigation categories)
- **moon_icons** (the different moon emojis used on the timers)
- **timer_types** (count-downs, count-ups)
- **gme_data** (market data from Yahoo)
- **data** (main data for each timer)
- **submitted** (new timer submissions through the in-app form)

### Installation & Local Development

Download the repo and:

    $ npm install

You will need to add the MONGODB_URI secret with the Vercel CLI

    $ vercel secrets add MONGODB_URI [your mongo connection string]

Then run the following to start up development mode (default port is 3000):

    vercel dev

### Schema Examples

#### Categories

```
{
	"id": 0,
	"name": "Home",
	"short_name": "home",
	"icon": "🏠"
}
```

**Note**: short_name is used for routing in the browser so the string must be [URL-encoded](https://www.urlencoder.org/) if it contains spaces or certain special characters

#### Moon Icons

```
{
	"id": 1,
	"icon": "🌑",
	"label": "Not Soon",
	"color": "#024A5B",
	"days": [181,9999999]
}
```

#### Timer Types

```
{
	"id": 1,
	"name": "Count-Down",
	"short_name": "count-down",
	"icon": "⏳",
	"color": "#b22222"
}
```

#### Market Data

```
{
	"Date": "2018-01-02",
	"Open": "17.959999",
	"High": "18.290001",
	"Low": "17.780001",
	"Close": "18.260000",
	"Adj Close": "15.953856",
	"Volume": "2832700"
}
```

#### Timer Data

```
{
	"id": 45,
	"category_id": 2,
	"title": "A Castle of Glass - Game On, Anon",
	"description": "Imperative top of post edit: For anyone who's already read this post, please go to the bottom and tell me to edit  isn't saying what I think it's saying...that info is a bit out of my field so I need help verifying this, but I deduced to the best of my ab…\n",
	"date": "2021-07-14T11:27:39.000Z",
	"url": "https://www.reddit.com/r/Superstonk/comments/ok2e0b/a_castle_of_glass_game_on_anon/",
	"reddit_id": "ok2e0b",
	"author": "3for100Specials"
}
```

**Note:** reddit_id and author are optional fields that are sent in by my Reddit bot
