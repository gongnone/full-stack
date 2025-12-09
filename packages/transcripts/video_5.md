WEBVTT
X-TIMESTAMP-MAP=LOCAL:00:00:00.000,MPEGTS:900000

00:00:00.672 --> 00:00:00.792
Now,

00:00:00.792 --> 00:00:01.272
in my opinion,

00:00:01.272 --> 00:00:03.432
if you're a full stack developer that primarily

00:00:03.432 --> 00:00:05.552
works within the JavaScript or TypeScript

00:00:05.552 --> 00:00:06.192
ecosystem,

00:00:06.192 --> 00:00:07.552
if you want to be efficient,

00:00:07.552 --> 00:00:09.592
you have to really understand how your project or

00:00:09.592 --> 00:00:11.552
framework is bundled and how it's run.

00:00:11.962 --> 00:00:14.412
the JavaScript ecosystem has done a great job at

00:00:14.412 --> 00:00:16.532
kind of abstracting a lot of that complexity away

00:00:16.532 --> 00:00:16.972
from us,

00:00:16.972 --> 00:00:18.852
but in turn what's happened is it's created a

00:00:18.852 --> 00:00:21.132
whole bunch of developers that don't really know

00:00:21.132 --> 00:00:22.292
what's going on behind the scenes.

00:00:22.662 --> 00:00:23.422
And because of that,

00:00:23.422 --> 00:00:25.662
they don't really know how to debug problems when

00:00:25.662 --> 00:00:26.222
they hit like,

00:00:26.222 --> 00:00:27.222
Edge cases and stuff.

00:00:27.222 --> 00:00:29.462
And running on Cloudflare because it's not like

00:00:29.462 --> 00:00:30.582
your common node,

00:00:30.722 --> 00:00:31.282
based environment,

00:00:31.682 --> 00:00:34.442
you do come across issues more often than if

00:00:34.442 --> 00:00:36.002
you're just like shipping something to Vercel

00:00:36.002 --> 00:00:37.682
because they've taken care of like,

00:00:37.682 --> 00:00:39.122
so much of that complexity for us.

00:00:39.122 --> 00:00:41.042
But I do think it's really important to understand

00:00:41.042 --> 00:00:41.682
these things.

00:00:41.682 --> 00:00:44.442
So what I'm going to try to attempt to kind of

00:00:44.442 --> 00:00:46.002
convey within this section is

00:00:46.322 --> 00:00:48.562
how to think about bundling of projects and how

00:00:48.562 --> 00:00:49.762
that relates to Cloudflare.

00:00:49.842 --> 00:00:50.242
So

00:00:50.712 --> 00:00:51.352
at its core,

00:00:51.352 --> 00:00:54.192
a Cloudflare worker is just an object that has a

00:00:54.192 --> 00:00:54.952
fetch handler,

00:00:55.112 --> 00:00:58.392
and that fetch handler can take in a HTTP request

00:00:58.552 --> 00:01:00.792
and then you get that request and you process it.

00:01:00.952 --> 00:01:03.192
This is a really good example that Cloudflare has

00:01:03.192 --> 00:01:05.512
on their playground because it basically looks at

00:01:05.512 --> 00:01:06.192
a path and it says,

00:01:06.192 --> 00:01:07.072
if it's API,

00:01:07.072 --> 00:01:08.472
let's just return some JSON.

00:01:08.632 --> 00:01:10.152
And if it's the homepage,

00:01:10.312 --> 00:01:12.752
let's return some like a welcome HTML.

00:01:12.752 --> 00:01:14.464
So this is the welcome page that you see here.

00:01:14.464 --> 00:01:16.175
It's a styled HTML page.

00:01:16.335 --> 00:01:18.415
And then if we head over to API,

00:01:18.783 --> 00:01:19.983
you're going to get that API.

00:01:20.143 --> 00:01:21.623
Now when you see something like this,

00:01:21.623 --> 00:01:22.263
you might be like,

00:01:22.263 --> 00:01:22.543
okay,

00:01:22.543 --> 00:01:24.023
that's great if I want to build like a super,

00:01:24.023 --> 00:01:25.183
super simple API.

00:01:25.183 --> 00:01:25.703
But like,

00:01:25.703 --> 00:01:27.463
how does this relate to my next JS project?

00:01:27.463 --> 00:01:29.303
Or how does this relate to my Sveltekill Pro,

00:01:29.303 --> 00:01:30.543
my Sveltekit project?

00:01:31.503 --> 00:01:31.943
you know,

00:01:31.943 --> 00:01:32.223
like,

00:01:32.623 --> 00:01:34.663
it might not seem super obvious if you're not

00:01:34.663 --> 00:01:36.583
really familiar with how these applications are

00:01:36.583 --> 00:01:38.383
bundled and shipped and like actually run.

00:01:38.383 --> 00:01:38.783
But,

00:01:39.023 --> 00:01:39.303
like,

00:01:39.303 --> 00:01:41.423
this is really all you need in order to deliver

00:01:41.823 --> 00:01:43.143
really any type of application.

00:01:43.143 --> 00:01:45.623
It's just a fetch handler that is able to dictate

00:01:45.623 --> 00:01:46.143
routing.

00:01:46.143 --> 00:01:47.583
Now Hono is

00:01:48.723 --> 00:01:49.203
it's a

00:01:49.583 --> 00:01:51.863
really lightweight framework that I think was

00:01:51.863 --> 00:01:54.553
primarily built to work on Cloudflare's,

00:01:54.553 --> 00:01:55.363
worker runtime,

00:01:55.363 --> 00:01:56.763
but it can work cross platform.

00:01:56.763 --> 00:01:58.843
It really isn't limited to just Cloudflare and

00:01:58.923 --> 00:02:01.123
it's kind of an express alternative that is really

00:02:01.123 --> 00:02:02.603
lightweight and super easy to use.

00:02:02.673 --> 00:02:03.483
and you can see here,

00:02:03.483 --> 00:02:05.603
essentially you have like an app that you're

00:02:05.603 --> 00:02:08.403
defining and then this is saying API and then it's

00:02:08.403 --> 00:02:10.283
going to return some JSON Cloudflare and then you

00:02:10.283 --> 00:02:12.163
could create as many routes as you want and

00:02:12.163 --> 00:02:14.403
specify which paths they are and you could even

00:02:14.403 --> 00:02:14.723
return

00:02:15.783 --> 00:02:16.463
HTML.

00:02:16.463 --> 00:02:16.783
You know,

00:02:16.783 --> 00:02:18.543
you could build a really lightweight framework on

00:02:18.543 --> 00:02:19.223
top of Hono,

00:02:19.223 --> 00:02:20.203
which I've a few people do,

00:02:20.203 --> 00:02:21.123
which is kind of cool.

00:02:21.493 --> 00:02:23.283
but it's not something that's really beefy and

00:02:23.283 --> 00:02:25.643
robust like Next JS or Tanstack Start or

00:02:25.643 --> 00:02:26.313
Sveltekit.

00:02:26.803 --> 00:02:29.523
now if you look at this and then you look at the

00:02:29.603 --> 00:02:30.963
actual worker entry point,

00:02:30.963 --> 00:02:31.763
it looks different.

00:02:32.403 --> 00:02:33.523
But at the end of the day,

00:02:33.523 --> 00:02:34.323
if you're looking,

00:02:34.483 --> 00:02:35.843
if you take a look at App,

00:02:36.243 --> 00:02:37.603
app is just an object

00:02:37.923 --> 00:02:39.683
that has a fetch handler here,

00:02:40.003 --> 00:02:42.563
and a fetch handler is all you need to actually be

00:02:42.563 --> 00:02:44.403
able to run server side code on the Cloudflare

00:02:44.403 --> 00:02:44.963
runtime.

00:02:45.343 --> 00:02:47.583
So let's take a look at how that relates to other

00:02:47.583 --> 00:02:48.143
frameworks.

00:02:48.143 --> 00:02:49.183
But in order to do that,

00:02:49.183 --> 00:02:51.023
we also have to understand bundling.

00:02:52.018 --> 00:02:54.178
Before React there was a typical development

00:02:54.338 --> 00:02:57.098
process where you would basically have all of your

00:02:57.098 --> 00:02:58.458
application logic on a server.

00:02:58.458 --> 00:03:00.018
You'd have HTML templates,

00:03:00.018 --> 00:03:01.458
you'd have some styling stuff,

00:03:01.818 --> 00:03:03.817
all within like a server based application,

00:03:03.817 --> 00:03:04.778
typically php,

00:03:04.778 --> 00:03:07.698
and then that server would deliver server rendered

00:03:07.698 --> 00:03:08.778
content to the client.

00:03:09.098 --> 00:03:10.898
Then React came out and there was some other

00:03:10.898 --> 00:03:11.658
frameworks before that,

00:03:11.658 --> 00:03:14.178
but React really like pioneered this like single

00:03:14.178 --> 00:03:15.338
page application model.

00:03:15.688 --> 00:03:17.568
when React came out essentially there was this

00:03:17.568 --> 00:03:19.568
like distinction between your front end and your

00:03:19.568 --> 00:03:20.008
back end.

00:03:20.088 --> 00:03:21.288
you would build a,

00:03:21.688 --> 00:03:24.008
you'd build a React application that took care of

00:03:24.008 --> 00:03:25.448
like routing locally,

00:03:26.018 --> 00:03:28.738
and that was all self contained like in the

00:03:28.738 --> 00:03:29.298
browser.

00:03:29.298 --> 00:03:31.418
Now the development process was typically you

00:03:31.418 --> 00:03:32.658
would build out your

00:03:32.758 --> 00:03:34.098
single page React application.

00:03:34.258 --> 00:03:37.178
You would run a build command which took all of

00:03:37.178 --> 00:03:39.178
that code and it would bundle it so it would

00:03:39.178 --> 00:03:41.778
create a bunch of JavaScript files and a bunch of

00:03:41.778 --> 00:03:44.098
styled CSS files and then it would also take that

00:03:44.098 --> 00:03:46.878
some HTML files and it would kind of put them in

00:03:46.878 --> 00:03:49.118
distinct folders and in distinct files and then

00:03:49.118 --> 00:03:51.798
they would be uploaded to a cdn and then you'd

00:03:51.798 --> 00:03:52.738
have some type of network,

00:03:52.978 --> 00:03:55.698
mechanism that when a user makes a request,

00:03:55.698 --> 00:03:57.218
it goes to a cdn,

00:03:57.378 --> 00:03:58.578
it gets those files,

00:03:58.738 --> 00:04:01.658
it loads them on the browser and the application

00:04:01.658 --> 00:04:02.177
renders.

00:04:02.177 --> 00:04:03.898
And then when the application renders it says

00:04:03.898 --> 00:04:04.178
okay,

00:04:04.178 --> 00:04:04.898
I need some data.

00:04:05.038 --> 00:04:08.078
that's when it goes to the API that you build to

00:04:08.078 --> 00:04:08.678
get data.

00:04:08.738 --> 00:04:11.538
and the API was a very distinct separate entity

00:04:11.858 --> 00:04:12.778
when you were developing.

00:04:12.778 --> 00:04:15.298
So you have your API code that gets deployed to a

00:04:15.298 --> 00:04:15.618
server.

00:04:15.698 --> 00:04:17.378
so there was kind of like a very clear distinction

00:04:17.378 --> 00:04:18.498
between these two and

00:04:18.818 --> 00:04:19.738
you very like,

00:04:19.738 --> 00:04:21.978
I think it was very rare for people to be writing

00:04:21.978 --> 00:04:24.218
code and not know that it was server,

00:04:24.218 --> 00:04:26.618
like not know if it was server side code or client

00:04:26.618 --> 00:04:27.218
side code.

00:04:27.218 --> 00:04:29.618
Now next JS and a few of these other popular

00:04:29.898 --> 00:04:31.998
Full Stack frameworks have kind of flipped this

00:04:31.998 --> 00:04:33.158
model on the head because

00:04:33.558 --> 00:04:35.478
you're building within a single project

00:04:35.798 --> 00:04:36.158
and,

00:04:36.158 --> 00:04:36.798
and you're building,

00:04:36.798 --> 00:04:37.198
you know,

00:04:37.198 --> 00:04:38.478
like you're creating React components.

00:04:38.478 --> 00:04:39.958
But sometimes those react components

00:04:40.608 --> 00:04:42.288
run on the server and get delivered to the client,

00:04:42.288 --> 00:04:43.648
or sometimes they're client only.

00:04:43.648 --> 00:04:45.728
And then you have like database calls and API

00:04:45.728 --> 00:04:46.088
calls.

00:04:46.088 --> 00:04:46.368
And

00:04:46.638 --> 00:04:48.788
there's just this level of abstraction that came

00:04:48.788 --> 00:04:50.988
with these frameworks that provide a really great

00:04:50.988 --> 00:04:51.788
developer experience.

00:04:52.408 --> 00:04:54.288
but because of that I do think there's a lot of

00:04:54.288 --> 00:04:56.568
developers that kind of miss this idea of,

00:04:56.888 --> 00:04:57.448
you know,

00:04:57.448 --> 00:04:57.848
where

00:04:58.168 --> 00:05:00.008
when am I actually writing server code?

00:05:00.088 --> 00:05:03.128
How do I not actually leak database secrets to a

00:05:03.128 --> 00:05:04.008
client and then

00:05:04.408 --> 00:05:06.688
on top of that they don't really understand like

00:05:06.688 --> 00:05:08.488
what's happening with the bundle because the

00:05:08.878 --> 00:05:09.678
client side bundle,

00:05:09.678 --> 00:05:11.438
where you have a whole bunch of these static files

00:05:11.438 --> 00:05:13.678
that get uploaded to a CDN is still,

00:05:14.238 --> 00:05:17.078
is still the path that these Full Stack frameworks

00:05:17.078 --> 00:05:17.358
take.

00:05:17.438 --> 00:05:17.698
But

00:05:17.738 --> 00:05:19.978
they also have a separate bundle specifically for

00:05:19.978 --> 00:05:20.858
server side code.

00:05:20.858 --> 00:05:23.578
So this layer right here where static assets are

00:05:23.578 --> 00:05:26.698
being loaded onto a CDN so they can be cached and

00:05:26.698 --> 00:05:26.978
then

00:05:27.298 --> 00:05:28.778
be reached by a user really,

00:05:28.778 --> 00:05:29.458
really quickly.

00:05:29.698 --> 00:05:31.298
And then the code that's actually going on a

00:05:31.298 --> 00:05:33.138
server and being executed are,

00:05:33.138 --> 00:05:33.778
are still,

00:05:33.858 --> 00:05:34.218
they're,

00:05:34.218 --> 00:05:34.529
they're still,

00:05:34.565 --> 00:05:35.885
they're still at play in this model.

00:05:35.885 --> 00:05:36.805
It's still like this,

00:05:36.805 --> 00:05:38.045
this pattern really hasn't changed.

00:05:38.045 --> 00:05:38.905
It's just the

00:05:38.905 --> 00:05:41.145
bundling process kind of takes care of the server

00:05:41.465 --> 00:05:41.865
and

00:05:42.185 --> 00:05:45.065
the static assets at the exact same time.

00:05:45.225 --> 00:05:47.465
So let's go ahead and look at a next application

00:05:47.465 --> 00:05:49.464
and then kind of like make a distinction between

00:05:49.464 --> 00:05:49.865
these

00:05:50.585 --> 00:05:53.505
and then make a distinction between static assets

00:05:53.505 --> 00:05:54.665
and actual server side code.

00:05:54.876 --> 00:05:56.996
you run your build command with Next js,

00:05:56.996 --> 00:05:59.276
it's going to dump a whole bunch of different

00:05:59.356 --> 00:06:01.566
files inside of these output

00:06:02.056 --> 00:06:03.336
inside of these output folders.

00:06:03.336 --> 00:06:05.376
So typically if you're looking at like a standard

00:06:05.376 --> 00:06:06.136
React application,

00:06:06.136 --> 00:06:07.896
it's going to go inside of a dist folder.

00:06:07.896 --> 00:06:08.216
But

00:06:08.776 --> 00:06:08.806
Next

00:06:08.956 --> 00:06:12.276
JS and especially Next with Open Next as the

00:06:12.276 --> 00:06:14.316
deployment adapter is going to have a very

00:06:14.316 --> 00:06:16.796
specific folder convention for where those files

00:06:16.796 --> 00:06:17.116
go.

00:06:17.436 --> 00:06:17.706
But,

00:06:17.776 --> 00:06:19.496
but this is something you typically don't think

00:06:19.496 --> 00:06:19.736
about.

00:06:19.736 --> 00:06:20.896
You very seldomly

00:06:21.376 --> 00:06:23.056
you're going to go look through these files.

00:06:23.056 --> 00:06:24.976
But it's kind of important to know what's going on

00:06:24.976 --> 00:06:25.296
here.

00:06:25.296 --> 00:06:27.776
So during that build process it's taken all the

00:06:27.776 --> 00:06:29.416
client side code and it's bundled it.

00:06:29.416 --> 00:06:29.926
So it

00:06:30.076 --> 00:06:32.796
should be really lightweight and efficient for

00:06:33.116 --> 00:06:35.596
a CDN to deliver it to a client and then for the

00:06:35.596 --> 00:06:37.116
browser to render it really quickly.

00:06:37.116 --> 00:06:39.236
But it's also taken all of your server side logic

00:06:39.236 --> 00:06:41.036
and it's put it behind a fetch handler.

00:06:41.036 --> 00:06:43.436
So the server side logic can render HTML on the

00:06:43.436 --> 00:06:45.236
server to deliver it to the client for SEO

00:06:45.236 --> 00:06:45.836
purposes,

00:06:45.896 --> 00:06:46.256
it can

00:06:46.736 --> 00:06:48.776
wrangle some data behind a database and return

00:06:48.776 --> 00:06:49.296
JSON.

00:06:49.616 --> 00:06:52.056
Next also has server functions which is just kind

00:06:52.056 --> 00:06:55.136
of a abstraction on top of a traditional API

00:06:55.136 --> 00:06:55.536
request.

00:06:55.536 --> 00:06:57.056
So all of that is also bundled

00:06:57.496 --> 00:06:58.936
as part of a server build.

00:06:59.016 --> 00:07:01.176
So if we take a look at the

00:07:02.266 --> 00:07:03.226
at the build

00:07:03.926 --> 00:07:05.046
at the build manifest,

00:07:05.046 --> 00:07:06.326
you're going to see that there's a whole bunch of

00:07:06.326 --> 00:07:08.606
these JavaScript files and these JavaScript files

00:07:08.606 --> 00:07:09.486
are put into chunks.

00:07:09.486 --> 00:07:12.846
So it kind of efficiently took isolated JavaScript

00:07:12.846 --> 00:07:13.206
that

00:07:13.716 --> 00:07:15.796
that is used probably for pages or specific

00:07:15.796 --> 00:07:19.156
components and it put them in small JS files that

00:07:19.156 --> 00:07:20.076
we can actually go see.

00:07:20.076 --> 00:07:21.716
If we head over to static and we go to chunks,

00:07:21.716 --> 00:07:23.236
you can see there's these nonsensical

00:07:23.636 --> 00:07:25.956
JavaScript bundles that are going to be used by

00:07:25.956 --> 00:07:26.276
our

00:07:26.366 --> 00:07:28.536
browser when our page loads for the very first

00:07:28.536 --> 00:07:30.296
time and then it's going to try to cache them on

00:07:30.296 --> 00:07:31.016
the browser side.

00:07:31.416 --> 00:07:32.376
Now because this is

00:07:32.406 --> 00:07:34.536
Next JS and you have the server side component

00:07:34.696 --> 00:07:35.016
open.

00:07:35.016 --> 00:07:37.816
Next is actually the deployment adapter here that

00:07:38.316 --> 00:07:41.116
gets the server side code in a compatible format

00:07:41.196 --> 00:07:41.596
for

00:07:42.236 --> 00:07:43.516
specifically for next year.

00:07:43.516 --> 00:07:45.556
So you can see you have this worker inside of this

00:07:45.556 --> 00:07:45.996
Open Next

00:07:46.296 --> 00:07:48.776
this was dynamically created at build time.

00:07:49.016 --> 00:07:51.416
Is this fetch handler that basic that is

00:07:51.416 --> 00:07:53.896
cloudflare compatible and it is going to be very

00:07:53.896 --> 00:07:54.456
usable,

00:07:54.666 --> 00:07:55.916
or it's going to be very understandable by

00:07:55.916 --> 00:07:58.236
cloudflare and then it's going to contain and

00:07:58.316 --> 00:08:00.516
manage all of the actual like server side logic

00:08:00.516 --> 00:08:01.276
for our

00:08:02.406 --> 00:08:03.926
for our server side code inside of our next

00:08:03.926 --> 00:08:04.406
application.

00:08:04.406 --> 00:08:06.246
And this is going to be essentially the process

00:08:06.326 --> 00:08:09.086
that is followed for all of these full Stack

00:08:09.086 --> 00:08:09.526
frameworks.

00:08:09.526 --> 00:08:11.446
There's typically a adapter,

00:08:11.886 --> 00:08:13.486
or some type of plugin,

00:08:13.726 --> 00:08:14.646
sometimes with vite,

00:08:14.646 --> 00:08:17.446
sometimes it's a dedicated adapter to compile your

00:08:17.446 --> 00:08:19.286
server side code to make it compatible with

00:08:19.286 --> 00:08:19.966
Cloudflare.

00:08:20.046 --> 00:08:22.446
So one thing that I really want to drill in here,

00:08:22.486 --> 00:08:23.706
is if you deploy this

00:08:24.426 --> 00:08:24.906
code

00:08:25.284 --> 00:08:26.718
and then we head over to

00:08:27.118 --> 00:08:27.998
Cloudflare.

00:08:27.998 --> 00:08:29.838
So I'm going to go ahead and open up the

00:08:29.838 --> 00:08:30.728
Cloudflare dashboard

00:08:31.116 --> 00:08:33.716
and I'm going to go look at this as my next

00:08:33.716 --> 00:08:34.396
application,

00:08:34.567 --> 00:08:35.675
head over to the logs

00:08:35.675 --> 00:08:38.012
and then we're going to turn real time logs on and

00:08:38.012 --> 00:08:38.852
then this is going to,

00:08:38.852 --> 00:08:40.012
when this is done deploying,

00:08:40.012 --> 00:08:42.812
this is going to give us an actual URL that we can

00:08:42.812 --> 00:08:43.364
use to hit it.

00:08:44.194 --> 00:08:45.915
so we're going to go ahead and open this URL.

00:08:47.457 --> 00:08:48.897
I'm going to put it in here

00:08:49.537 --> 00:08:51.057
and then let's open our,

00:08:51.457 --> 00:08:53.737
let's open this console and let's go to the

00:08:53.737 --> 00:08:54.417
network tab.

00:08:54.417 --> 00:08:54.857
Okay.

00:08:54.857 --> 00:08:57.777
Let's make sure our real time logs are coming in.

00:08:58.017 --> 00:08:59.697
Now I'm going to load this page and what you're

00:08:59.697 --> 00:09:01.337
going to notice is there's a whole bunch of

00:09:01.337 --> 00:09:03.577
requests that actually are made and these are the

00:09:03.577 --> 00:09:04.977
requests to go grab those

00:09:05.057 --> 00:09:06.397
static JavaScript bundles.

00:09:06.397 --> 00:09:08.917
So this is actually being cached on Cloudflare

00:09:08.917 --> 00:09:09.517
CDN.

00:09:09.697 --> 00:09:09.977
It's really,

00:09:09.977 --> 00:09:10.337
really quick.

00:09:10.337 --> 00:09:12.657
If you look at like the actual travel time for

00:09:12.657 --> 00:09:13.017
this stuff,

00:09:13.017 --> 00:09:13.377
it's really,

00:09:13.377 --> 00:09:15.177
really fast because it's getting pulled from a

00:09:15.177 --> 00:09:16.017
server that's really,

00:09:16.017 --> 00:09:16.897
really close to me,

00:09:16.897 --> 00:09:18.177
that's managed by Cloudflare.

00:09:18.417 --> 00:09:20.697
Now if we go ahead and we look at the actual.

00:09:20.697 --> 00:09:21.377
Looks like their

00:09:21.597 --> 00:09:22.957
time logs aren't working right now.

00:09:22.957 --> 00:09:25.676
But if you look at the actual real time log for

00:09:25.676 --> 00:09:25.917
this,

00:09:25.917 --> 00:09:28.117
you're going to see there's only one request

00:09:28.197 --> 00:09:29.077
that's being made.

00:09:29.397 --> 00:09:31.957
You're not seeing a request to the homepage

00:09:32.277 --> 00:09:33.477
and then also to

00:09:33.626 --> 00:09:33.977
the

00:09:34.717 --> 00:09:35.197
random

00:09:36.097 --> 00:09:40.017
the random SVG files and the random image files

00:09:40.017 --> 00:09:43.097
and the random JavaScript bundles because these

00:09:43.097 --> 00:09:44.977
are all part of the same domain host,

00:09:45.057 --> 00:09:46.937
but it's actually being pulled from different

00:09:46.937 --> 00:09:47.417
servers.

00:09:47.417 --> 00:09:47.777
So

00:09:48.177 --> 00:09:49.577
when you're looking at Cloudflare,

00:09:49.577 --> 00:09:51.017
when you're looking at like the requests that you

00:09:51.017 --> 00:09:51.297
receive,

00:09:51.297 --> 00:09:53.497
your build per request now it's very cheap.

00:09:53.497 --> 00:09:54.257
After you have,

00:09:54.257 --> 00:09:55.977
if you're on the Pay tier after 10 million

00:09:55.977 --> 00:09:56.737
requests,

00:09:56.897 --> 00:09:58.737
it's $0.3 per million request.

00:09:58.737 --> 00:09:59.047
So it's

00:09:59.047 --> 00:09:59.237
a very,

00:09:59.237 --> 00:10:00.117
very generous in terms,

00:10:00.117 --> 00:10:01.557
it's very generous in terms of pricing.

00:10:01.557 --> 00:10:01.877
But

00:10:02.357 --> 00:10:02.607
you know,

00:10:02.677 --> 00:10:02.877
you know,

00:10:02.877 --> 00:10:03.637
like if you look,

00:10:03.637 --> 00:10:05.917
imagine if every single one of these requests

00:10:05.917 --> 00:10:07.637
reached out and invoked the worker.

00:10:07.637 --> 00:10:07.997
You know,

00:10:07.997 --> 00:10:10.117
like every single page load would be like 25

00:10:10.117 --> 00:10:11.077
different requests.

00:10:11.237 --> 00:10:12.957
But that's actually not how the billing works

00:10:12.957 --> 00:10:14.277
because it's not going to the worker,

00:10:14.277 --> 00:10:15.637
it's going to the cdn.

00:10:15.637 --> 00:10:16.507
It's going to manage,

00:10:16.697 --> 00:10:18.817
servers by cloudflare to get those static assets

00:10:18.817 --> 00:10:19.737
delivered really,

00:10:19.737 --> 00:10:20.457
really quickly.

00:10:20.537 --> 00:10:23.017
So configuring your project and typically if

00:10:23.017 --> 00:10:23.897
you're using a framework,

00:10:23.897 --> 00:10:25.457
you're going to be using a template that already

00:10:25.457 --> 00:10:26.617
has that bundle,

00:10:26.687 --> 00:10:28.317
and the build process taken care of for you.

00:10:28.317 --> 00:10:30.637
So it's set up in a way where when you deploy,

00:10:31.197 --> 00:10:31.677
it's

00:10:32.297 --> 00:10:32.857
instructing

00:10:32.967 --> 00:10:35.717
Cloudflare on which files are the static assets

00:10:35.717 --> 00:10:38.077
that go to the CDN and then what your server side

00:10:38.077 --> 00:10:41.277
entry point is to actually invoke your worker.

00:10:41.357 --> 00:10:43.357
So this is pretty important to know because you

00:10:43.357 --> 00:10:46.357
technically could serve assets via a worker if you

00:10:46.357 --> 00:10:46.957
wanted to.

00:10:47.307 --> 00:10:48.477
it's just if you're having like,

00:10:48.477 --> 00:10:50.037
if you a lot of these full stack frameworks,

00:10:50.037 --> 00:10:51.357
if you look at this network tab,

00:10:51.357 --> 00:10:53.157
it could make like hundreds of requests to grab

00:10:53.157 --> 00:10:53.757
all these assets.

00:10:53.757 --> 00:10:56.277
And you don't necessarily want a worker to be

00:10:56.277 --> 00:10:57.877
invoked every single time because it's not the

00:10:57.877 --> 00:10:58.317
most efficient,

00:10:58.317 --> 00:10:59.997
it's not an efficient way of doing it because that

00:10:59.997 --> 00:11:00.757
data doesn't change.

00:11:00.917 --> 00:11:02.517
You might as well put it on a cdn,

00:11:02.517 --> 00:11:03.777
let the CDN and cache it.

00:11:03.777 --> 00:11:05.927
Data transfer is very cheap at that layer.

00:11:05.927 --> 00:11:06.217
with.

00:11:06.537 --> 00:11:07.897
For most projects that you're going to be

00:11:07.897 --> 00:11:08.977
deploying on the Cloudflare,

00:11:08.977 --> 00:11:10.537
you're not really even considering that as part of

00:11:10.537 --> 00:11:12.697
your price as you become more of an enterprise

00:11:12.697 --> 00:11:13.137
customer,

00:11:13.137 --> 00:11:14.777
there is prices associated with that.

00:11:14.777 --> 00:11:16.537
But it's very cheap to do that.

00:11:16.547 --> 00:11:18.527
whereas like the server side logic is still cheap,

00:11:18.527 --> 00:11:18.807
but

00:11:19.207 --> 00:11:21.247
it isn't as it is a little bit more

00:11:21.247 --> 00:11:22.327
computationally expensive.

00:11:22.457 --> 00:11:24.057
and this is actually what we're built on.

00:11:24.057 --> 00:11:25.977
So this is just a really important point to note

00:11:25.977 --> 00:11:28.297
is there's a clear distinction between our,

00:11:28.467 --> 00:11:29.287
static assets

00:11:29.907 --> 00:11:30.867
that get bundled,

00:11:30.877 --> 00:11:33.767
and then uploaded to Cloudflare CDN and our server

00:11:33.767 --> 00:11:36.047
side code that gets uploaded into the worker

00:11:36.047 --> 00:11:38.607
runtime environment so our workers can be invoked

00:11:38.607 --> 00:11:40.273
and actually handle business logic on the server.

00:11:40.292 --> 00:11:41.812
Now that we understand a little bit more about the

00:11:41.812 --> 00:11:42.612
bundling process,

00:11:42.722 --> 00:11:44.132
and different caveats

00:11:44.452 --> 00:11:45.892
when deploying to Cloudflare,

00:11:46.132 --> 00:11:48.332
I think it's also important to understand how to

00:11:48.332 --> 00:11:50.572
manage environment variables because this is

00:11:50.572 --> 00:11:52.771
really the thing that is the most different in the

00:11:52.771 --> 00:11:53.652
Cloudflare environment

00:11:54.052 --> 00:11:56.652
versus node based applications or really any other

00:11:56.652 --> 00:11:57.462
like JavaScript,

00:11:57.462 --> 00:11:58.892
application that you build that server side.

00:11:59.132 --> 00:11:59.532
So

00:11:59.972 --> 00:12:02.572
if you look at like really any docs online and

00:12:02.572 --> 00:12:04.372
this is the source of so much confusion for

00:12:04.372 --> 00:12:04.692
people,

00:12:05.142 --> 00:12:06.182
if you're creating a client,

00:12:06.182 --> 00:12:08.342
whether it be a connection to a database or

00:12:08.342 --> 00:12:09.702
through an API provider,

00:12:09.862 --> 00:12:11.942
you'll probably see that there will be some type

00:12:11.942 --> 00:12:12.742
of like handler

00:12:12.822 --> 00:12:13.282
that is

00:12:13.682 --> 00:12:15.842
defined kind of globally within the project.

00:12:15.842 --> 00:12:16.242
It's,

00:12:16.242 --> 00:12:17.922
it's built during build time

00:12:18.222 --> 00:12:20.222
that are basically during build time

00:12:20.702 --> 00:12:22.862
this code is going to be compiled and then during

00:12:22.862 --> 00:12:24.942
runtime it's able to grab the process

00:12:25.422 --> 00:12:26.142
EMV,

00:12:27.302 --> 00:12:28.102
like GitHub,

00:12:28.182 --> 00:12:30.422
client ID or API secret or

00:12:30.942 --> 00:12:31.222
secret.

00:12:31.302 --> 00:12:33.182
So this is a very common pattern.

00:12:33.182 --> 00:12:33.402
And,

00:12:33.552 --> 00:12:34.832
and if you go this route,

00:12:34.832 --> 00:12:36.032
if you just kind of like take

00:12:36.512 --> 00:12:38.472
some documentation you see online for a

00:12:38.472 --> 00:12:40.592
traditional node based environment and then you

00:12:40.592 --> 00:12:41.792
put this in your code base,

00:12:41.792 --> 00:12:43.152
it most likely is going to fail.

00:12:43.152 --> 00:12:45.312
And the reason it's going to fail is you don't

00:12:45.312 --> 00:12:47.312
have access to process in the node based

00:12:47.312 --> 00:12:47.632
environment.

00:12:47.632 --> 00:12:49.152
This is a very node specific thing.

00:12:49.152 --> 00:12:49.952
Even though other

00:12:50.632 --> 00:12:52.432
other frameworks and even Cloudflare,

00:12:52.432 --> 00:12:54.592
with a caveat with like an exception that we'll go

00:12:54.592 --> 00:12:54.872
through,

00:12:55.192 --> 00:12:55.982
use this process

00:12:56.302 --> 00:12:57.342
EMB convention,

00:12:57.342 --> 00:12:59.262
this is actually not the best way to do it within

00:12:59.262 --> 00:13:00.582
the Cloudflare ecosystem.

00:13:00.582 --> 00:13:00.942
So

00:13:01.392 --> 00:13:03.312
typically with the node based application you'd

00:13:03.312 --> 00:13:05.652
create a do EMV file and you go ahead and put

00:13:05.652 --> 00:13:07.732
those secrets in and then when you deploy you put

00:13:07.732 --> 00:13:09.492
those secrets and whatever your deployment

00:13:09.492 --> 00:13:10.042
provider

00:13:10.312 --> 00:13:11.672
is using for secret management.

00:13:11.992 --> 00:13:14.472
And then when the application is deployed it's

00:13:14.472 --> 00:13:14.952
basically

00:13:15.272 --> 00:13:17.112
running a command that's like export

00:13:18.952 --> 00:13:19.352
var

00:13:19.911 --> 00:13:21.032
equals value.

00:13:21.192 --> 00:13:22.792
That's kind of like what it's going to look like

00:13:22.792 --> 00:13:23.832
and then it's going to be

00:13:24.232 --> 00:13:25.432
available in that

00:13:26.072 --> 00:13:26.082
actual

00:13:26.332 --> 00:13:27.852
like process emb call.

00:13:28.012 --> 00:13:30.092
Now with Cloudflare we do it a little bit

00:13:30.092 --> 00:13:30.452
differently.

00:13:30.452 --> 00:13:31.212
We create a,

00:13:31.572 --> 00:13:34.652
for development purposes we create a dev.vars

00:13:34.652 --> 00:13:35.732
folder or file

00:13:36.052 --> 00:13:37.492
and from there you can

00:13:37.812 --> 00:13:40.252
define secrets and other variables that you want

00:13:40.252 --> 00:13:40.612
to use

00:13:40.722 --> 00:13:41.652
inside of your application.

00:13:41.652 --> 00:13:43.812
I think it's mostly only makes sense to put

00:13:43.812 --> 00:13:45.892
secrets in here but I do see sometimes people put

00:13:45.892 --> 00:13:47.752
like static variables as well.

00:13:48.232 --> 00:13:48.792
And then

00:13:49.272 --> 00:13:51.072
almost all these applications they should be set

00:13:51.072 --> 00:13:53.272
up to basically Have a command where you say npm

00:13:53.432 --> 00:13:56.632
run CF Cloudflare type gen

00:13:58.022 --> 00:14:00.822
and then when you run that it's going to take

00:14:00.822 --> 00:14:02.982
those vars and it's going to put it in an

00:14:02.982 --> 00:14:03.622
interface.

00:14:03.672 --> 00:14:05.862
and this interface is going to be type safe within

00:14:05.862 --> 00:14:06.462
your code.

00:14:06.462 --> 00:14:08.702
So this is a Hono application.

00:14:08.702 --> 00:14:10.062
So in our Honor application,

00:14:10.062 --> 00:14:11.582
if we wanted to get that var,

00:14:12.142 --> 00:14:12.203
what

00:14:12.233 --> 00:14:14.553
Now what we could do is we could basically say C

00:14:14.553 --> 00:14:17.873
for context.emv.my VAR.

00:14:17.873 --> 00:14:19.353
And you see that that's going to show up.

00:14:19.353 --> 00:14:20.473
So we could basically say

00:14:20.793 --> 00:14:22.833
my VAR equals C emv.

00:14:22.833 --> 00:14:24.593
And this is how you can basically inject secrets

00:14:24.593 --> 00:14:25.193
into your code.

00:14:25.193 --> 00:14:26.633
Now the difference here is

00:14:27.233 --> 00:14:27.473
you

00:14:27.793 --> 00:14:30.033
have access to them during runtime,

00:14:30.193 --> 00:14:32.873
so you're able to like when you handle an API

00:14:32.873 --> 00:14:33.193
request,

00:14:33.193 --> 00:14:34.593
you're able to grab those variables,

00:14:34.593 --> 00:14:34.913
those

00:14:34.923 --> 00:14:36.613
variables and those secrets like this.

00:14:36.613 --> 00:14:37.013
Now

00:14:37.503 --> 00:14:40.623
I do like to typically move that logic out and

00:14:40.783 --> 00:14:42.143
throughout the course we're going to go into

00:14:42.143 --> 00:14:43.823
patterns to kind of make it so like,

00:14:44.143 --> 00:14:44.623
you know,

00:14:44.623 --> 00:14:46.263
you don't have a whole bunch of boilerplate every

00:14:46.263 --> 00:14:47.823
single time you do something where you extract

00:14:47.823 --> 00:14:49.503
variables and you put them into your

00:14:49.583 --> 00:14:51.063
like different functions and stuff.

00:14:51.063 --> 00:14:53.023
But essentially what you do is if this was a

00:14:53.023 --> 00:14:53.703
database secret,

00:14:53.703 --> 00:14:54.383
you could also

00:14:54.993 --> 00:14:57.033
instantiate or create your database client at this

00:14:57.033 --> 00:14:57.553
level too.

00:14:57.553 --> 00:14:59.153
And I like to kind of move that stuff out.

00:14:59.153 --> 00:15:02.233
But the main point to drive home in is you don't

00:15:02.233 --> 00:15:04.833
want to like set this up globally within your

00:15:04.833 --> 00:15:06.433
application because you're not going to be able to

00:15:06.433 --> 00:15:08.433
access this with the process emv.

00:15:08.833 --> 00:15:09.172
Now

00:15:09.172 --> 00:15:09.552
different,

00:15:10.182 --> 00:15:12.542
different full Stack frameworks handle these

00:15:12.542 --> 00:15:15.102
environments variables differently depending on

00:15:15.102 --> 00:15:15.942
how they're built.

00:15:15.942 --> 00:15:16.342
So

00:15:16.812 --> 00:15:17.212
the

00:15:18.332 --> 00:15:20.012
next JS way of doing it

00:15:20.492 --> 00:15:23.012
is basically you don't have like access to this

00:15:23.012 --> 00:15:25.252
context that gets passed in to all of the

00:15:25.252 --> 00:15:25.982
different like

00:15:25.982 --> 00:15:27.352
server side actions and

00:15:27.672 --> 00:15:29.592
to your server side routes and stuff.

00:15:29.752 --> 00:15:31.832
But what you do have is you have the

00:15:32.262 --> 00:15:34.012
They do give you this Cloudflare

00:15:34.442 --> 00:15:36.042
this is a specific one for pages,

00:15:36.042 --> 00:15:37.642
but they have also something very simple,

00:15:37.802 --> 00:15:39.162
similar for workers as well,

00:15:39.162 --> 00:15:41.282
where you're able to grab the context of the

00:15:41.282 --> 00:15:42.842
request through a helper function.

00:15:42.842 --> 00:15:43.722
So you can basically

00:15:44.332 --> 00:15:44.892
grab your

00:15:44.992 --> 00:15:45.452
context,

00:15:45.452 --> 00:15:47.372
you can grab the EMV and then you can get your

00:15:47.372 --> 00:15:49.192
environment variables for Cloudflare.

00:15:49.772 --> 00:15:51.692
Now the one caveat here is

00:15:52.152 --> 00:15:53.512
right now Tanstack Start.

00:15:53.512 --> 00:15:55.592
So Tanstack Start is built on Nitro.

00:15:55.592 --> 00:15:56.152
It's a

00:15:56.992 --> 00:15:58.872
It's Basically like something that's somewhat

00:15:58.872 --> 00:16:01.752
similar to Vite where it takes care of like a

00:16:01.752 --> 00:16:04.192
whole bunch of the generic JavaScript based

00:16:04.272 --> 00:16:04.892
server,

00:16:04.892 --> 00:16:05.552
functionality.

00:16:05.552 --> 00:16:08.472
So you can build a framework on top of Vite and it

00:16:08.472 --> 00:16:10.312
takes care of like a whole bunch of bundling

00:16:10.312 --> 00:16:10.672
stuff.

00:16:10.672 --> 00:16:12.712
So they have all of these like runtimes that they

00:16:12.712 --> 00:16:13.712
support and they have

00:16:14.002 --> 00:16:15.962
a whole bundling convention on how they can

00:16:15.962 --> 00:16:18.722
actually take like your Nitro based framework,

00:16:18.892 --> 00:16:21.142
that you kind of built with your own flavor and

00:16:21.142 --> 00:16:22.982
then bundle in a way that's understandable by

00:16:22.982 --> 00:16:23.702
cloud provider.

00:16:23.702 --> 00:16:25.182
So there's this configuration.

00:16:25.182 --> 00:16:27.582
Now Nitro is actually like the one

00:16:27.732 --> 00:16:30.442
example that I've seen where you still grab it

00:16:30.442 --> 00:16:31.642
through like process

00:16:32.042 --> 00:16:32.602
emv.

00:16:32.602 --> 00:16:34.402
The only thing is you need to grab it up from

00:16:34.402 --> 00:16:35.402
process EMV

00:16:35.722 --> 00:16:37.242
during the server side runtime.

00:16:37.302 --> 00:16:38.782
so that's like the main caveat here.

00:16:38.782 --> 00:16:40.342
So like sometimes this is actually still

00:16:40.872 --> 00:16:42.312
the convention but that's just because

00:16:42.952 --> 00:16:44.072
Nitro has

00:16:44.632 --> 00:16:47.432
compiled the code in a way where that those

00:16:47.432 --> 00:16:49.352
environment variables for cloudflare are actually

00:16:49.352 --> 00:16:51.352
available through the process emv.

00:16:51.512 --> 00:16:54.072
Now this can be really confusing because like so

00:16:54.072 --> 00:16:55.712
many different frameworks have so many different

00:16:55.712 --> 00:16:56.712
tools that are

00:16:57.652 --> 00:17:00.212
adapting the framework for a specific runtime

00:17:00.212 --> 00:17:01.772
where you kind of have to learn like the runtime

00:17:01.772 --> 00:17:03.412
specific way of doing something and it can be

00:17:03.412 --> 00:17:03.772
tedious.

00:17:03.772 --> 00:17:06.572
But I do think the future is much more bright than

00:17:06.572 --> 00:17:08.932
it has been and the reason why is because of Vite

00:17:09.332 --> 00:17:09.547
now.

00:17:10.061 --> 00:17:11.741
Now you might have noticed a lot of Full Stack

00:17:11.741 --> 00:17:14.301
frameworks are actually moving all of their build

00:17:14.301 --> 00:17:15.581
tooling over to Vite,

00:17:15.581 --> 00:17:17.821
because Vite has a whole bunch of different like

00:17:18.031 --> 00:17:18.821
server logic,

00:17:18.821 --> 00:17:19.901
dev server logic,

00:17:20.381 --> 00:17:20.411
standardization,

00:17:20.961 --> 00:17:22.121
of how they bundle stuff.

00:17:22.121 --> 00:17:24.121
They've done a great job at just taking the best

00:17:24.121 --> 00:17:25.201
practices across

00:17:25.601 --> 00:17:26.401
a lot of different

00:17:26.811 --> 00:17:29.191
deployment providers and then also Full Stack

00:17:29.191 --> 00:17:29.751
frameworks.

00:17:29.751 --> 00:17:31.231
And they've tried to build something that's like

00:17:31.231 --> 00:17:31.791
very generic,

00:17:31.791 --> 00:17:33.431
that can work for a lot of different use cases.

00:17:33.511 --> 00:17:35.871
So Vite is a really great build tool and I just

00:17:35.871 --> 00:17:37.351
think it's becoming more and more popular.

00:17:37.731 --> 00:17:39.571
More and more frameworks are continuously adopting

00:17:39.571 --> 00:17:39.811
it.

00:17:39.811 --> 00:17:40.331
Like right now,

00:17:40.331 --> 00:17:42.131
tanstextart is in the process of

00:17:42.531 --> 00:17:44.451
moving everything completely over to Vite,

00:17:44.451 --> 00:17:45.251
which is pretty cool.

00:17:45.251 --> 00:17:48.811
Now Vite has an environment API of like the way

00:17:48.811 --> 00:17:50.611
that they say you should be managing environment

00:17:50.691 --> 00:17:51.321
variables,

00:17:51.321 --> 00:17:53.071
server side and then also client side.

00:17:53.391 --> 00:17:53.790
And

00:17:54.201 --> 00:17:57.231
when Full Stack frameworks are using Vite as their

00:17:57.231 --> 00:17:57.911
build tool,

00:17:58.231 --> 00:17:59.951
essentially what Vite is saying is like,

00:17:59.951 --> 00:18:01.991
you should conform to this environment API.

00:18:01.991 --> 00:18:04.551
That way we can take care of the cross platform,

00:18:04.621 --> 00:18:06.821
bundling for you and that should just work across

00:18:06.821 --> 00:18:07.301
the board.

00:18:07.381 --> 00:18:08.661
So this is still like,

00:18:08.881 --> 00:18:09.121
you know,

00:18:09.121 --> 00:18:11.481
a continuous process and there's still a lot of

00:18:11.481 --> 00:18:12.521
like progress to be made.

00:18:12.521 --> 00:18:14.441
But more and more tooling I've seen over,

00:18:14.441 --> 00:18:15.521
even just last year,

00:18:15.761 --> 00:18:18.241
it's become so much easier to deploy to cloudflare

00:18:18.241 --> 00:18:19.441
just because of Vite.

00:18:19.521 --> 00:18:19.921
And

00:18:20.151 --> 00:18:22.101
cloudflare is also investing in Vite as well.

00:18:22.101 --> 00:18:22.271
They've

00:18:22.541 --> 00:18:25.021
they built a specific Vite plugin for cloudflare

00:18:25.021 --> 00:18:25.341
services.

00:18:25.421 --> 00:18:27.621
Now right now they don't support all of the

00:18:27.621 --> 00:18:28.461
frameworks but

00:18:28.711 --> 00:18:30.301
they are working with a lot of other like

00:18:30.301 --> 00:18:31.701
framework maintainers to make sure

00:18:31.811 --> 00:18:32.881
the cloudflare Vite

00:18:33.161 --> 00:18:34.361
plugin is going to work with

00:18:34.651 --> 00:18:36.891
different frameworks as long as they're being

00:18:36.891 --> 00:18:37.931
bundled with Vite.

00:18:38.011 --> 00:18:40.851
So there's a lot of really great work happening in

00:18:40.851 --> 00:18:41.131
the space.

00:18:41.131 --> 00:18:42.811
So I do think it's worth keeping an eye out.

00:18:42.811 --> 00:18:43.811
And if a framework's like,

00:18:43.811 --> 00:18:44.051
yeah,

00:18:44.051 --> 00:18:45.811
we're moving over to like the newest version of

00:18:45.811 --> 00:18:47.651
Vite and we're investing heavily in that being our

00:18:47.651 --> 00:18:48.331
only build tool.

00:18:48.571 --> 00:18:50.571
I think that framework has a good future because I

00:18:50.571 --> 00:18:52.211
do think personally Vite's going to have a very

00:18:52.211 --> 00:18:52.635
good future.

00:18:52.809 --> 00:18:54.209
Now the last thing that I want to touch on with

00:18:54.209 --> 00:18:55.969
environment variables is how we can actually

00:18:55.969 --> 00:18:58.009
access them and manage them when we deploy.

00:18:58.009 --> 00:19:00.689
So in production now what we did here is inside of

00:19:00.689 --> 00:19:03.809
this dev vars file which we should put in our git,

00:19:03.809 --> 00:19:05.449
ignore and never commit it to GitHub.

00:19:05.699 --> 00:19:07.449
we specified like this random secret,

00:19:07.449 --> 00:19:08.169
this test secret.

00:19:08.169 --> 00:19:09.569
Then we ran CF type gen,

00:19:09.929 --> 00:19:11.689
that became available through our

00:19:12.089 --> 00:19:14.529
environment here and then we're able to access it

00:19:14.529 --> 00:19:15.519
in a type safe way

00:19:15.519 --> 00:19:16.249
within our code.

00:19:16.249 --> 00:19:17.649
Now this is locally,

00:19:17.649 --> 00:19:19.369
this is going to work locally as we're developing,

00:19:19.369 --> 00:19:19.689
but

00:19:20.229 --> 00:19:21.509
we do if we actually want to

00:19:22.099 --> 00:19:24.259
have access to these when we deploy.

00:19:24.339 --> 00:19:26.859
So there's two core ways of managing secrets and

00:19:26.859 --> 00:19:28.179
we're going to go through both of them really,

00:19:28.179 --> 00:19:28.739
really quick.

00:19:28.739 --> 00:19:30.259
So the very first one,

00:19:30.259 --> 00:19:32.699
and this has been the way for like the last year

00:19:32.699 --> 00:19:33.979
that I've been developing on cloudflare,

00:19:33.979 --> 00:19:36.179
this has been like the core way of doing it is

00:19:36.819 --> 00:19:37.379
you can,

00:19:37.379 --> 00:19:39.659
you basically can come over here to Variables and

00:19:39.659 --> 00:19:40.057
Secrets,

00:19:40.092 --> 00:19:40.492
you

00:19:40.812 --> 00:19:42.732
can select secret and then you can say

00:19:44.092 --> 00:19:45.382
my variable,

00:19:46.412 --> 00:19:47.892
you have to give it the exact same name that you

00:19:47.892 --> 00:19:48.892
do inside of here.

00:19:48.892 --> 00:19:51.452
And honestly you could just like they have this

00:19:51.452 --> 00:19:52.172
nifty wave,

00:19:52.172 --> 00:19:53.852
you could just paste it in here and it

00:19:54.412 --> 00:19:55.452
should be able to

00:19:56.104 --> 00:19:57.824
should be able to grab the key and the value and

00:19:57.824 --> 00:19:58.984
then just make sure it's a secret.

00:19:58.984 --> 00:19:59.864
If it's text

00:20:00.504 --> 00:20:00.944
it'll,

00:20:00.944 --> 00:20:02.014
you'll be able to read it,

00:20:02.694 --> 00:20:03.694
inside of the ui.

00:20:03.694 --> 00:20:04.454
But if it's a secret,

00:20:04.534 --> 00:20:05.774
this is kind of a one time thing.

00:20:05.774 --> 00:20:07.254
You'll never be able to see the secret again.

00:20:07.414 --> 00:20:08.454
And when you do that,

00:20:08.774 --> 00:20:09.174
this

00:20:09.774 --> 00:20:10.294
and when you do that,

00:20:10.294 --> 00:20:11.294
when you save and deploy,

00:20:11.374 --> 00:20:13.614
your application will now have access to that

00:20:14.094 --> 00:20:14.734
variable.

00:20:14.734 --> 00:20:16.934
Now you could also manage these secrets through

00:20:16.934 --> 00:20:18.014
the Wrangler cli.

00:20:18.174 --> 00:20:20.214
They have a command where you can give it a key

00:20:20.214 --> 00:20:21.934
and a value and it will upload it as well.

00:20:21.934 --> 00:20:24.414
But I don't really follow that pattern.

00:20:24.414 --> 00:20:26.414
I do like to kind of manage the secrets through

00:20:26.414 --> 00:20:27.014
the ui.

00:20:27.014 --> 00:20:27.374
Now

00:20:27.934 --> 00:20:29.214
the thing to note here is

00:20:29.534 --> 00:20:30.094
this is

00:20:30.164 --> 00:20:32.194
a secret that's only available for this

00:20:32.194 --> 00:20:32.754
application.

00:20:33.074 --> 00:20:33.474
And

00:20:34.164 --> 00:20:36.724
a lot of times you'll have like a database key or

00:20:36.724 --> 00:20:39.564
an API key that's going to be used across multiple

00:20:39.564 --> 00:20:40.164
different services.

00:20:40.244 --> 00:20:43.314
And it could be kind of tedious to upload that

00:20:43.314 --> 00:20:44.834
secret to every single service,

00:20:44.914 --> 00:20:46.914
especially if you have like dozens of services,

00:20:46.914 --> 00:20:47.634
if it's a much,

00:20:47.634 --> 00:20:48.314
much bigger

00:20:48.794 --> 00:20:49.914
solution that you're building.

00:20:50.154 --> 00:20:51.394
So cloudflare recently,

00:20:51.394 --> 00:20:52.474
within the last few months,

00:20:52.474 --> 00:20:54.674
they actually created this product called Secret

00:20:54.674 --> 00:20:55.274
Store.

00:20:55.514 --> 00:20:57.834
Now with Secret Store it's very similar process.

00:20:57.954 --> 00:20:59.294
you provide a secret name,

00:20:59.454 --> 00:21:01.294
you give it access to a permission scope.

00:21:01.294 --> 00:21:02.614
With right now it seems that they only have

00:21:02.614 --> 00:21:03.214
workers available.

00:21:03.614 --> 00:21:04.654
You give it the value

00:21:05.114 --> 00:21:05.674
then you save.

00:21:05.674 --> 00:21:06.754
And when you save all the,

00:21:06.904 --> 00:21:09.224
all of your applications technically will have

00:21:09.224 --> 00:21:09.984
access to that.

00:21:09.984 --> 00:21:11.304
All of your worker applications.

00:21:11.384 --> 00:21:13.944
Now in order for your worker to be able to

00:21:13.944 --> 00:21:15.994
actually like pick up and use that

00:21:15.994 --> 00:21:16.264
secret,

00:21:16.744 --> 00:21:18.744
what you're going to want to do is you're going to

00:21:18.744 --> 00:21:19.304
want to say

00:21:19.354 --> 00:21:20.354
Inside of your

00:21:21.314 --> 00:21:22.754
wrangler JSON C,

00:21:23.554 --> 00:21:26.274
you'll have this additional configuration that you

00:21:26.274 --> 00:21:29.074
can say Secret Store and then you pass in the

00:21:29.154 --> 00:21:29.954
binding name.

00:21:30.114 --> 00:21:32.234
So you'll be able to access the secret by saying

00:21:32.234 --> 00:21:32.594
like

00:21:33.134 --> 00:21:34.134
that binding name.

00:21:34.134 --> 00:21:34.654
And then

00:21:35.384 --> 00:21:36.664
you'll be able to say like

00:21:37.304 --> 00:21:37.354
secret

00:21:37.564 --> 00:21:37.964
name.

00:21:38.174 --> 00:21:40.504
this is what you put inside of here.

00:21:41.704 --> 00:21:43.744
And then when you create it it will give you an

00:21:43.744 --> 00:21:43.984
id.

00:21:43.984 --> 00:21:45.464
So I guess I will just like say

00:21:46.024 --> 00:21:46.424
test

00:21:47.224 --> 00:21:47.624
key

00:21:48.065 --> 00:21:48.465
value.

00:21:49.504 --> 00:21:50.575
I'm going to hit save.

00:21:50.575 --> 00:21:51.133
Okay,

00:21:51.133 --> 00:21:51.933
so this is.

00:21:51.933 --> 00:21:53.253
So I gave it the test key name.

00:21:53.253 --> 00:21:54.773
I probably should have made this lowercase.

00:21:54.773 --> 00:21:56.693
But when this is done pending

00:21:57.063 --> 00:21:58.143
we'll have access to it.

00:21:58.143 --> 00:21:59.463
But basically you would put in

00:22:00.133 --> 00:22:01.573
the secret name would be like this.

00:22:04.345 --> 00:22:05.945
And then when we run CF type gen

00:22:10.942 --> 00:22:13.101
we're going to see in our code base will now

00:22:13.901 --> 00:22:14.301
const.

00:22:14.861 --> 00:22:15.581
Test key

00:22:15.981 --> 00:22:17.581
should now have access to

00:22:18.221 --> 00:22:18.621
this

00:22:18.801 --> 00:22:20.241
test API key which

00:22:21.021 --> 00:22:21.661
we defined

00:22:21.981 --> 00:22:22.621
right here.

00:22:22.781 --> 00:22:23.181
So

00:22:23.551 --> 00:22:24.191
this is the,

00:22:24.191 --> 00:22:25.311
this is the best way of doing it.

00:22:25.311 --> 00:22:27.711
If you want to kind of define like one key one

00:22:27.711 --> 00:22:29.951
time inside of the UI and then have it available

00:22:30.031 --> 00:22:31.871
across all the workers in your account,

00:22:32.111 --> 00:22:33.031
you can go this route.

00:22:33.031 --> 00:22:33.711
If you really just.

00:22:33.711 --> 00:22:35.511
It's kind of like a one off thing where it's only

00:22:35.511 --> 00:22:36.591
applicable to one worker.

00:22:36.751 --> 00:22:38.271
You can do that inside of the worker

00:22:38.271 --> 00:22:38.872
configuration.

