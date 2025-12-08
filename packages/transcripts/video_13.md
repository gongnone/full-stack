WEBVTT
X-TIMESTAMP-MAP=LOCAL:00:00:00.000,MPEGTS:900000

00:00:00.556 --> 00:00:00.876
Okay,

00:00:00.876 --> 00:00:03.916
so now let's head back to our index TS file in our

00:00:03.916 --> 00:00:04.556
data service.

00:00:04.796 --> 00:00:07.476
So as you can see here we have a very basic fetch

00:00:07.476 --> 00:00:09.196
handler that returns hello world.

00:00:09.516 --> 00:00:11.036
So for this data service

00:00:11.356 --> 00:00:13.356
we are going to have a few different routes,

00:00:13.356 --> 00:00:15.196
meaning a few different paths that

00:00:16.176 --> 00:00:17.296
or users can hit

00:00:17.776 --> 00:00:19.416
that handle some logic.

00:00:19.416 --> 00:00:20.176
And if you

00:00:20.736 --> 00:00:22.936
look at how we currently have the user application

00:00:22.936 --> 00:00:23.456
set up

00:00:23.856 --> 00:00:25.483
where we have our worker

00:00:25.483 --> 00:00:28.072
and inside of our workers and index TS file,

00:00:28.072 --> 00:00:29.032
we're kind of saying

00:00:30.362 --> 00:00:30.682
here.

00:00:30.682 --> 00:00:34.362
If the URL that's provided by the request has a

00:00:34.362 --> 00:00:36.442
path name that starts with trpc,

00:00:36.442 --> 00:00:38.562
then we're going to handle the TRPC stuff.

00:00:38.562 --> 00:00:38.922
And

00:00:39.472 --> 00:00:41.282
essentially like imagine if you had a whole bunch

00:00:41.282 --> 00:00:41.842
of different routes,

00:00:41.842 --> 00:00:42.402
maybe you had

00:00:42.802 --> 00:00:44.562
API forward slash auth,

00:00:44.952 --> 00:00:45.782
all of that different,

00:00:46.102 --> 00:00:47.062
all these different routes.

00:00:47.592 --> 00:00:49.552
You would essentially be having a whole bunch of

00:00:49.552 --> 00:00:52.392
boilerplate of like manually parsing paths and

00:00:52.392 --> 00:00:53.552
then routing conditionally.

00:00:53.552 --> 00:00:53.912
And

00:00:54.232 --> 00:00:56.332
whenever you find yourself kind of building out

00:00:56.332 --> 00:00:57.092
that use case,

00:00:57.172 --> 00:01:00.132
you've kind of exceeded what type of logic should

00:01:00.132 --> 00:01:01.572
live inside of a fetch handler.

00:01:01.812 --> 00:01:03.812
And that's when you should bring in a different

00:01:04.112 --> 00:01:05.192
routing framework.

00:01:05.192 --> 00:01:06.432
Now there's a lot of different

00:01:06.912 --> 00:01:09.632
web frameworks that accomplish this exact thing.

00:01:10.032 --> 00:01:10.752
My favorite,

00:01:10.912 --> 00:01:12.352
not just for Cloudflare workers,

00:01:12.352 --> 00:01:14.112
but for other runtimes as well

00:01:14.412 --> 00:01:15.212
is Hono.

00:01:15.552 --> 00:01:18.552
Hono is a very lightweight web framework that I

00:01:18.552 --> 00:01:20.552
think was originally built to make the development

00:01:20.552 --> 00:01:22.472
process on cloudflare Worker so much better.

00:01:22.712 --> 00:01:23.592
But they've also

00:01:24.062 --> 00:01:26.172
become so popular that it's not just a cloudflare

00:01:26.172 --> 00:01:26.732
worker thing.

00:01:26.732 --> 00:01:28.812
Like people are actually building full stack

00:01:28.812 --> 00:01:30.212
frameworks on top of Hono.

00:01:30.212 --> 00:01:31.532
They're doing server side rendering,

00:01:31.612 --> 00:01:33.052
they're doing a whole bunch of cool stuff.

00:01:33.052 --> 00:01:36.732
But for me I almost exclusively use it for APIs,

00:01:36.842 --> 00:01:39.592
building like rest APIs that are either internal

00:01:39.592 --> 00:01:40.462
service facing,

00:01:40.462 --> 00:01:42.712
for like services to communicate with each other

00:01:43.082 --> 00:01:45.122
or in some situations actually building it

00:01:45.122 --> 00:01:46.282
externally facing.

00:01:46.362 --> 00:01:46.762
So

00:01:47.102 --> 00:01:49.402
users of an application are consuming an API as a

00:01:49.402 --> 00:01:49.642
product.

00:01:49.802 --> 00:01:52.402
So Hono can really accomplish all of these

00:01:52.402 --> 00:01:54.962
different use cases and the integration process is

00:01:54.962 --> 00:01:55.602
really easy.

00:01:55.602 --> 00:01:58.122
Now the documentation for Hono to integrate,

00:01:58.122 --> 00:01:59.402
if you look at like how to

00:01:59.492 --> 00:02:01.282
deploy Hono application on Cloudflare,

00:02:01.282 --> 00:02:03.522
they're going to have a very specific Hono way of

00:02:03.522 --> 00:02:05.642
doing it and you can totally go that route.

00:02:05.642 --> 00:02:07.962
But what I like to do is I like to basically say

00:02:07.962 --> 00:02:09.922
the entry point for a cloudflare worker

00:02:10.222 --> 00:02:11.582
is this snippet of code.

00:02:11.662 --> 00:02:14.902
And then everything that I build on top of this is

00:02:14.902 --> 00:02:15.902
going to be wired in,

00:02:15.902 --> 00:02:17.982
in a more like manual way.

00:02:18.142 --> 00:02:20.982
So we'll just make sure we have Hono installed.

00:02:20.982 --> 00:02:22.502
It should already be installed in this project,

00:02:22.502 --> 00:02:24.702
but you can run PMPM Ihono.

00:02:24.732 --> 00:02:25.490
just to make sure.

00:02:26.176 --> 00:02:27.616
Now that is installed,

00:02:28.336 --> 00:02:31.056
what we're going to do is we are going to actually

00:02:31.056 --> 00:02:32.016
create a

00:02:32.656 --> 00:02:35.416
new folder inside of Source and I'm going to call

00:02:35.416 --> 00:02:36.256
it Hono.

00:02:36.416 --> 00:02:36.696
You can,

00:02:36.766 --> 00:02:38.206
you could probably call this API as well,

00:02:38.206 --> 00:02:40.846
but this isn't just going to be like a REST API as

00:02:40.846 --> 00:02:41.006
well.

00:02:41.006 --> 00:02:42.766
There's going to be a few other use cases for it.

00:02:42.766 --> 00:02:44.126
So I'm going to call it Hono.

00:02:44.126 --> 00:02:45.406
Just make it really descriptive.

00:02:45.506 --> 00:02:46.966
and then inside of Hono,

00:02:47.046 --> 00:02:49.606
I'm going to create a app ts.

00:02:51.501 --> 00:02:52.926
Now inside of the app ts,

00:02:52.926 --> 00:02:55.126
we're obviously going to want to import Hono,

00:02:55.126 --> 00:02:56.446
so we'll go ahead and do that.

00:02:57.836 --> 00:03:00.396
And then what we're going to do is we are going to

00:03:00.396 --> 00:03:01.916
set up the actual Hono app.

00:03:02.076 --> 00:03:03.236
So a Hono app.

00:03:03.236 --> 00:03:05.116
This is the typical configuration.

00:03:05.934 --> 00:03:06.734
a lot of like,

00:03:06.734 --> 00:03:08.214
examples you're just going to see is going to say

00:03:08.214 --> 00:03:09.934
like const app new Hono.

00:03:10.014 --> 00:03:12.414
And you might not see the bindings here,

00:03:12.734 --> 00:03:13.974
which is totally okay.

00:03:13.974 --> 00:03:14.494
This is a,

00:03:14.494 --> 00:03:15.774
this is a valid setup.

00:03:15.774 --> 00:03:16.574
But for us,

00:03:16.974 --> 00:03:18.574
what we're going to do is we're going to make sure

00:03:18.574 --> 00:03:20.854
that this is exported so we can use it in our

00:03:20.854 --> 00:03:21.774
worker entry point.

00:03:22.014 --> 00:03:24.094
And then we're also going to be saying the

00:03:24.094 --> 00:03:26.174
bindings are going to be our cloudflare,

00:03:26.344 --> 00:03:27.434
EMV bindings.

00:03:27.514 --> 00:03:27.798
So,

00:03:28.219 --> 00:03:28.859
that this,

00:03:28.859 --> 00:03:29.539
so this is the,

00:03:29.539 --> 00:03:31.859
this is like the basic setup of an application.

00:03:31.859 --> 00:03:34.019
And then from here what we can do is we can build

00:03:34.019 --> 00:03:35.099
out actual routes.

00:03:35.339 --> 00:03:37.499
So the first route that we're going to build out

00:03:37.499 --> 00:03:39.819
is basically we're going to say app dot get

00:03:40.299 --> 00:03:41.259
and we're going to say

00:03:41.579 --> 00:03:41.589
colon

00:03:42.039 --> 00:03:42.399
id

00:03:42.879 --> 00:03:44.079
and then inside of this

00:03:44.574 --> 00:03:45.654
section of the handler,

00:03:45.654 --> 00:03:47.094
we're going to be able to actually handle the

00:03:47.094 --> 00:03:47.534
request.

00:03:47.534 --> 00:03:49.974
So what's happening here is basically this is a

00:03:49.974 --> 00:03:50.654
dynamic.

00:03:51.384 --> 00:03:52.464
is a dynamic path

00:03:52.784 --> 00:03:53.424
where the

00:03:53.984 --> 00:03:54.384
ID

00:03:54.704 --> 00:03:57.904
of a given link is going to be routed to.

00:03:58.064 --> 00:03:58.464
So,

00:03:59.394 --> 00:04:01.394
essentially when we create a link in our

00:04:01.394 --> 00:04:01.834
dashboard,

00:04:01.834 --> 00:04:03.754
it's just kind of this random id and then when

00:04:03.754 --> 00:04:04.754
that is clicked,

00:04:04.754 --> 00:04:07.594
it should hit this endpoint and then our service

00:04:07.594 --> 00:04:10.034
is going to be able to pull this ID and we're

00:04:10.034 --> 00:04:11.554
going to be able to look up all the routing

00:04:11.554 --> 00:04:12.834
configuration for it.

00:04:12.914 --> 00:04:13.314
So,

00:04:13.754 --> 00:04:16.114
what you're going to notice is we have a few

00:04:16.114 --> 00:04:16.394
different

00:04:16.544 --> 00:04:18.014
things with this context.

00:04:18.014 --> 00:04:20.014
So C is for context in Hono

00:04:20.594 --> 00:04:20.834
and

00:04:21.234 --> 00:04:23.154
we're going to have access to EMV

00:04:23.474 --> 00:04:24.834
where we have our bindings.

00:04:25.474 --> 00:04:28.114
We're also going to have access to the request.

00:04:28.754 --> 00:04:29.874
This is the actual like

00:04:30.284 --> 00:04:31.354
request that's being made.

00:04:31.354 --> 00:04:33.194
This is going to contain headers and cookies and

00:04:33.194 --> 00:04:33.674
whatnot.

00:04:33.834 --> 00:04:36.394
We're also going to have access to the response.

00:04:37.674 --> 00:04:40.714
So if you want to set cookies that get saved on

00:04:40.714 --> 00:04:41.434
the client side,

00:04:41.434 --> 00:04:43.274
you could also do that with the response.

00:04:43.534 --> 00:04:44.094
and then

00:04:44.414 --> 00:04:45.374
there's a few other things.

00:04:45.374 --> 00:04:47.614
Like if we want to just like say C

00:04:48.094 --> 00:04:48.654
JSON,

00:04:49.394 --> 00:04:52.194
we could just basically say return C JSON

00:04:53.474 --> 00:04:56.794
and we could give like some data hello world.

00:04:56.794 --> 00:04:58.954
So I think we'll just start with this for now.

00:04:58.954 --> 00:04:59.314
So

00:04:59.494 --> 00:05:01.234
the context is really powerful with Hono.

00:05:01.234 --> 00:05:02.874
You notice we didn't have to like import a whole

00:05:02.874 --> 00:05:04.314
bunch of stuff to get this to work.

00:05:04.314 --> 00:05:06.394
We just have like a very basic

00:05:07.344 --> 00:05:09.264
handler here and it's saying

00:05:10.054 --> 00:05:12.054
it's just returning a JSON object of hello world.

00:05:12.054 --> 00:05:13.694
And we're going to extend this further as we go

00:05:13.694 --> 00:05:13.974
along.

00:05:14.134 --> 00:05:15.974
But what we're going to want to do is we're going

00:05:15.974 --> 00:05:17.174
to want to head back to our,

00:05:17.536 --> 00:05:19.776
we're going to want to head back to our index ts

00:05:20.176 --> 00:05:20.816
and then

00:05:21.216 --> 00:05:24.176
our fetch handler is no longer just going to

00:05:24.176 --> 00:05:25.296
return hello world.

00:05:25.296 --> 00:05:27.216
What it's going to do is it's going to return

00:05:28.336 --> 00:05:30.656
app and we're going to import that from Hono

00:05:31.136 --> 00:05:31.726
and the

00:05:31.726 --> 00:05:34.786
of a Hono instance will have a fetch handler.

00:05:34.786 --> 00:05:36.546
So it's just kind of going to be a pass through

00:05:36.546 --> 00:05:37.346
fetch handler

00:05:37.666 --> 00:05:39.826
where we pass through the request.

00:05:40.466 --> 00:05:42.466
Now this isn't all we're going to pass through.

00:05:43.426 --> 00:05:44.226
a service,

00:05:44.466 --> 00:05:45.666
a worker entry point

00:05:46.066 --> 00:05:47.666
also has access to

00:05:48.066 --> 00:05:48.706
an environment.

00:05:49.266 --> 00:05:50.466
So these are our bindings.

00:05:50.786 --> 00:05:52.466
It also has access to

00:05:52.826 --> 00:05:53.626
a context.

00:05:54.026 --> 00:05:56.346
Now this returns some cloudflare specific stuff.

00:05:56.346 --> 00:05:57.546
Like we have a

00:05:58.096 --> 00:05:59.066
wait until method,

00:05:59.066 --> 00:06:01.906
which basically we can pass code snippets into

00:06:01.906 --> 00:06:05.226
this wait until method that can execute after the

00:06:05.226 --> 00:06:06.066
request is received.

00:06:06.306 --> 00:06:08.226
So if you have some background tasks that you want

00:06:08.226 --> 00:06:08.466
to run,

00:06:08.466 --> 00:06:09.906
that's only going to take a few seconds.

00:06:10.356 --> 00:06:11.716
this is a great way of doing it and we're actually

00:06:11.716 --> 00:06:12.676
going to use this

00:06:13.816 --> 00:06:14.936
in the next few videos.

00:06:14.936 --> 00:06:15.976
But for now

00:06:16.376 --> 00:06:19.376
if we notice the fetch handler actually takes in a

00:06:19.376 --> 00:06:20.056
few extra things.

00:06:20.056 --> 00:06:21.056
It takes in a request,

00:06:21.056 --> 00:06:23.376
it takes in an emv and it also takes in an

00:06:23.376 --> 00:06:24.536
execution context.

00:06:24.616 --> 00:06:26.496
So we're going to pass those things in.

00:06:26.496 --> 00:06:28.616
So we're going to say this EMV and this

00:06:29.336 --> 00:06:29.936
context.

00:06:29.936 --> 00:06:33.016
And you notice this is all type safe because Hono

00:06:33.016 --> 00:06:36.016
has made a insanely great interface that works

00:06:36.016 --> 00:06:37.656
with standard web requests,

00:06:37.906 --> 00:06:39.826
but it also works perfectly with

00:06:40.146 --> 00:06:43.266
the specific nuances of the cloudflare runtime as

00:06:43.266 --> 00:06:43.506
well.

00:06:43.586 --> 00:06:44.706
So from here

00:06:45.986 --> 00:06:48.226
it's just a very simple pass through our fetch

00:06:48.226 --> 00:06:50.906
handler for our worker entry point is just passing

00:06:50.906 --> 00:06:52.866
it into our fetch handler,

00:06:52.976 --> 00:06:53.376
for

00:06:53.696 --> 00:06:55.056
our Hono application.

00:06:55.056 --> 00:06:56.016
So now if we

00:06:56.336 --> 00:06:58.256
PNPM run dev,

00:06:58.870 --> 00:06:59.988
this should start up

00:07:00.388 --> 00:07:01.388
and this Hono,

00:07:01.388 --> 00:07:03.628
this hello world should be not found because we

00:07:03.628 --> 00:07:05.748
don't have our homepage built out.

00:07:06.278 --> 00:07:06.518
But

00:07:06.838 --> 00:07:09.638
if you just do any type of random id,

00:07:10.918 --> 00:07:12.838
what you're going to notice is we actually get

00:07:12.838 --> 00:07:13.158
that

00:07:13.558 --> 00:07:13.568
hello,

00:07:13.878 --> 00:07:15.358
world JSON response.

00:07:15.998 --> 00:07:17.728
So this is how we set up Hono.

00:07:17.888 --> 00:07:19.008
it's very,

00:07:19.248 --> 00:07:20.008
very simple.

00:07:20.008 --> 00:07:20.888
Like you know,

00:07:20.888 --> 00:07:22.568
you're going to read a whole bunch of like how to

00:07:22.568 --> 00:07:23.008
do this,

00:07:23.238 --> 00:07:25.328
like how to articles or watch videos or go through

00:07:25.328 --> 00:07:26.008
the documentation.

00:07:26.008 --> 00:07:26.488
But just

00:07:26.808 --> 00:07:27.208
the

00:07:28.808 --> 00:07:30.848
limited amount of code that we've had to write to

00:07:30.848 --> 00:07:32.008
actually get this to work

00:07:32.258 --> 00:07:32.738
is awesome.

00:07:32.738 --> 00:07:33.178
You know,

00:07:33.178 --> 00:07:35.298
just a very simple Hono app

00:07:35.618 --> 00:07:36.258
creation,

00:07:36.578 --> 00:07:37.618
defining a route.

00:07:37.618 --> 00:07:39.538
And we can define as many routes as we want.

00:07:39.598 --> 00:07:40.908
and then you could even break this up.

00:07:40.908 --> 00:07:43.068
So if your application is like a really big API,

00:07:43.228 --> 00:07:45.068
you can create folders where you create

00:07:45.388 --> 00:07:46.108
multiple,

00:07:46.638 --> 00:07:49.318
Hono instances and then all of those get wired

00:07:49.318 --> 00:07:50.358
into the same route.

00:07:50.428 --> 00:07:50.948
that's like,

00:07:50.948 --> 00:07:51.588
they have a lot,

00:07:51.588 --> 00:07:53.028
lot of information on how to do that in the

00:07:53.028 --> 00:07:53.548
documentation,

00:07:53.548 --> 00:07:55.668
but it's such a robust framework that we're

00:07:55.668 --> 00:07:56.308
building on top of.

00:07:56.308 --> 00:07:58.708
And then the integration for it is also painfully

00:07:58.708 --> 00:07:58.988
simple.

00:07:58.988 --> 00:07:59.468
It's just

00:08:00.088 --> 00:08:02.328
passing the request into our fetch handler and

00:08:02.328 --> 00:08:04.648
then also making sure that we include our

00:08:05.128 --> 00:08:06.688
environment and our context.

00:08:06.688 --> 00:08:07.648
If you don't include these,

00:08:07.648 --> 00:08:08.568
especially the environment,

00:08:08.898 --> 00:08:10.738
when you actually try to access your binding

00:08:10.738 --> 00:08:12.418
inside of your Hono application,

00:08:12.658 --> 00:08:14.178
you'll be getting errors because

00:08:14.658 --> 00:08:16.978
the context no longer would have access to that.

00:08:17.458 --> 00:08:18.978
So that's where we're going to stop this one.

00:08:19.138 --> 00:08:20.198
and then coming up,

00:08:20.198 --> 00:08:22.918
we're going to extend this to actually handle our

00:08:24.328 --> 00:08:25.862
dynamic routing logic.

