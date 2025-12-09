WEBVTT
X-TIMESTAMP-MAP=LOCAL:00:00:00.000,MPEGTS:900000

00:00:00.023 --> 00:00:00.303
All right,

00:00:00.303 --> 00:00:02.303
so now that we understand how to use bindings to

00:00:02.303 --> 00:00:03.703
access secrets and variables,

00:00:03.703 --> 00:00:06.263
let's talk about binding resources to our actual

00:00:06.263 --> 00:00:07.303
worker application.

00:00:07.783 --> 00:00:09.983
a good example of this would basically be if you

00:00:09.983 --> 00:00:10.743
come over to

00:00:11.693 --> 00:00:12.763
storage and databases,

00:00:12.843 --> 00:00:14.163
you're going to notice we have a few different

00:00:14.163 --> 00:00:14.683
products here.

00:00:14.683 --> 00:00:17.723
We have a KV for a caching key value store.

00:00:17.723 --> 00:00:19.683
We have a SQL D1 database.

00:00:19.683 --> 00:00:21.563
This is a SQLite powered database that we're going

00:00:21.563 --> 00:00:22.523
to be using throughout the course.

00:00:22.523 --> 00:00:23.123
This is free,

00:00:23.123 --> 00:00:25.033
it's part of the free cloudflare tier.

00:00:25.063 --> 00:00:28.203
hyperdrive is a proxy to postgres databases.

00:00:28.203 --> 00:00:29.723
It's a really cool product but I don't want to go

00:00:29.723 --> 00:00:30.793
too deep into it right now.

00:00:31.153 --> 00:00:32.913
we have queues which we're going to use pretty

00:00:32.913 --> 00:00:34.673
deeply in the course analytics engine.

00:00:34.923 --> 00:00:36.603
then you have R2 object storage.

00:00:36.603 --> 00:00:38.363
So if you want to store like large files,

00:00:38.363 --> 00:00:38.843
images,

00:00:38.923 --> 00:00:39.403
text,

00:00:39.483 --> 00:00:40.203
videos,

00:00:40.223 --> 00:00:41.343
big huge JSON blocks,

00:00:41.343 --> 00:00:43.303
this is like a great storage mechanism for that.

00:00:43.303 --> 00:00:45.223
And they have a free tier so you have to put in a

00:00:45.223 --> 00:00:45.983
credit card but you know,

00:00:45.983 --> 00:00:46.743
you like have

00:00:47.243 --> 00:00:48.843
certain amount of gigabytes that you get for free

00:00:48.843 --> 00:00:50.523
every single month and then you have these

00:00:50.523 --> 00:00:53.463
operations so deletes and reads and updates and

00:00:53.463 --> 00:00:53.943
whatnot.

00:00:53.943 --> 00:00:56.343
So this is honestly so stinking cheap.

00:00:56.343 --> 00:00:58.743
If you Compare it to S3 it's even cheaper than S3

00:00:58.743 --> 00:01:00.063
and it's S3 compatible from,

00:01:00.063 --> 00:01:00.743
from Amazon.

00:01:00.743 --> 00:01:01.663
So pretty cool.

00:01:01.663 --> 00:01:02.423
So anyways,

00:01:02.423 --> 00:01:04.623
I'm just going through this because all of these

00:01:04.623 --> 00:01:05.703
things are resources.

00:01:05.703 --> 00:01:07.743
These are basically like types of compute or data

00:01:07.743 --> 00:01:10.103
store that we want to be able to access from our

00:01:10.103 --> 00:01:10.423
worker.

00:01:10.423 --> 00:01:11.503
And in Cloudflare,

00:01:11.823 --> 00:01:14.023
binding a worker to a resource that's within

00:01:14.023 --> 00:01:16.223
Cloudflare's ecosystem is really easy.

00:01:16.223 --> 00:01:17.103
And it's like,

00:01:17.103 --> 00:01:18.783
I mean it's really easy but it's also

00:01:19.263 --> 00:01:19.583
really,

00:01:19.583 --> 00:01:20.303
really powerful.

00:01:20.303 --> 00:01:21.903
So they have this page bindings,

00:01:21.903 --> 00:01:22.343
they have like,

00:01:22.343 --> 00:01:23.023
some of these bind,

00:01:23.763 --> 00:01:25.363
have access to and you can see there's also like

00:01:25.363 --> 00:01:25.923
AI.

00:01:25.923 --> 00:01:28.163
So there's this whole AI section where they have a

00:01:28.163 --> 00:01:30.123
vector database if you want to like build a vector

00:01:30.123 --> 00:01:30.883
based application.

00:01:31.733 --> 00:01:32.373
they have

00:01:33.123 --> 00:01:33.523
they,

00:01:33.763 --> 00:01:35.243
they have workers AI.

00:01:35.243 --> 00:01:36.763
These are a whole bunch of open source models that

00:01:36.763 --> 00:01:38.323
you can access without having to like go to

00:01:38.323 --> 00:01:39.122
OpenAI or other

00:01:39.923 --> 00:01:40.643
providers.

00:01:41.523 --> 00:01:42.403
They have images,

00:01:42.483 --> 00:01:43.123
they have

00:01:43.593 --> 00:01:45.553
Something that I find really cool is they have

00:01:45.553 --> 00:01:47.313
workflows that we're going to go really deep into.

00:01:47.313 --> 00:01:48.753
So there's a whole bunch of different things here.

00:01:48.753 --> 00:01:49.993
And for all of these products,

00:01:50.073 --> 00:01:51.193
if you just click on it,

00:01:51.273 --> 00:01:53.073
the documentations will basically Say like,

00:01:53.073 --> 00:01:55.333
here's how you use it in a work if you want to get

00:01:55.333 --> 00:01:56.933
a cape key key value.

00:01:57.613 --> 00:01:58.893
so that's what we're going to do right now,

00:01:58.893 --> 00:02:00.893
really quick just to kind of understand how we're

00:02:00.893 --> 00:02:01.213
going to,

00:02:01.213 --> 00:02:03.373
how to bind a resource to a worker.

00:02:03.613 --> 00:02:05.293
So if we head over to our

00:02:05.575 --> 00:02:06.478
storage and databases,

00:02:06.478 --> 00:02:07.398
let's go to kb,

00:02:07.478 --> 00:02:08.238
create an instance.

00:02:08.238 --> 00:02:10.987
I'm going to call this test cache for now.

00:02:10.987 --> 00:02:13.274
And then essentially what you have to do now that

00:02:13.274 --> 00:02:14.114
we have this created,

00:02:14.114 --> 00:02:15.434
you can head over to your

00:02:16.234 --> 00:02:17.654
Wrangler JSON file.

00:02:17.654 --> 00:02:19.894
And because this has a schema attached to it,

00:02:19.894 --> 00:02:21.334
depending on which IDE you use,

00:02:21.414 --> 00:02:23.174
you can actually like without even really having

00:02:23.394 --> 00:02:24.274
go look at the docs.

00:02:24.514 --> 00:02:26.674
It'll give you some type hints that will probably

00:02:26.674 --> 00:02:27.714
guide you through this.

00:02:27.714 --> 00:02:28.994
Because like I don't have this memorized,

00:02:28.994 --> 00:02:30.514
but I just kind of come through here.

00:02:30.674 --> 00:02:31.714
I'm going to say like,

00:02:31.714 --> 00:02:34.354
I'm looking for KV KV namespaces.

00:02:34.434 --> 00:02:36.914
You can have more than one KV namespace associated

00:02:36.914 --> 00:02:37.554
with your

00:02:38.134 --> 00:02:39.054
worker application.

00:02:39.294 --> 00:02:40.454
It's going to take a binding,

00:02:40.454 --> 00:02:43.294
I'll call this cache and then it's also going to

00:02:43.294 --> 00:02:46.214
take a ID so we can run over and we can grab this

00:02:46.214 --> 00:02:47.054
ID right here.

00:02:47.134 --> 00:02:49.374
Now another thing that you're going to note here,

00:02:49.374 --> 00:02:50.414
a lot of the

00:02:50.734 --> 00:02:52.654
a lot of these resources have this

00:02:53.134 --> 00:02:53.934
experimental

00:02:54.394 --> 00:02:55.154
and what experimental?

00:02:55.154 --> 00:02:55.634
Remote.

00:02:55.634 --> 00:02:57.154
This is a new feature that they've rolled out.

00:02:57.154 --> 00:02:58.914
If you're watching this course a few months from

00:02:58.914 --> 00:02:59.114
now,

00:02:59.114 --> 00:03:00.554
this might not be experimental anymore,

00:03:00.554 --> 00:03:01.644
it might just be remote.

00:03:01.674 --> 00:03:02.634
so if it's different,

00:03:02.634 --> 00:03:03.514
don't worry too much.

00:03:03.514 --> 00:03:05.074
We're going to use this feature throughout the

00:03:05.074 --> 00:03:05.274
course.

00:03:05.274 --> 00:03:06.874
But essentially what this means is when you're

00:03:06.874 --> 00:03:07.834
developing locally

00:03:08.324 --> 00:03:09.654
Typically what happens is when,

00:03:09.654 --> 00:03:10.814
when you're developing Locally,

00:03:10.814 --> 00:03:13.494
there's this dot wrangler folder and this has the

00:03:13.494 --> 00:03:14.494
state v3.

00:03:14.494 --> 00:03:15.654
There's a whole bunch of like,

00:03:16.254 --> 00:03:17.974
like all of these Cloudflare resources.

00:03:17.974 --> 00:03:19.894
There's the simulated environment that you,

00:03:19.894 --> 00:03:21.844
that spins up when you run this application

00:03:21.844 --> 00:03:25.084
locally and it like stores your data within the

00:03:25.084 --> 00:03:25.684
application.

00:03:26.194 --> 00:03:28.954
which means when you're like making a request to a

00:03:28.954 --> 00:03:29.834
key value store,

00:03:29.834 --> 00:03:31.354
you're actually just like sourcing out of this

00:03:31.354 --> 00:03:33.314
folder when you're developing locally and you're

00:03:33.314 --> 00:03:36.353
not going to the actual hosted version,

00:03:37.124 --> 00:03:38.564
the hosted resource now,

00:03:38.914 --> 00:03:39.664
it's kind of like

00:03:40.144 --> 00:03:41.904
one that's a pretty major inconvenience when

00:03:41.904 --> 00:03:42.384
you're developing.

00:03:42.384 --> 00:03:43.944
Like a lot of times you want to just be able to

00:03:43.944 --> 00:03:44.864
like have,

00:03:45.274 --> 00:03:45.634
you know,

00:03:45.634 --> 00:03:47.834
access the actual store that you're using or the

00:03:47.834 --> 00:03:48.954
actual resource that you're using.

00:03:49.314 --> 00:03:51.714
so what this flag does is it basically says when

00:03:51.714 --> 00:03:52.794
you're running this locally,

00:03:52.794 --> 00:03:55.874
it actually goes and it uses this specific

00:03:56.224 --> 00:03:57.024
key like

00:03:57.024 --> 00:03:58.194
KB namespace.

00:03:58.194 --> 00:03:59.834
But for right now we're not going to worry about

00:03:59.834 --> 00:04:00.094
that.

00:04:00.094 --> 00:04:01.194
we're going to use this throughout the course.

00:04:01.194 --> 00:04:02.674
This is just going to be locally.

00:04:02.844 --> 00:04:04.204
so I'm going to say npm

00:04:05.804 --> 00:04:07.316
NPM run CF

00:04:07.371 --> 00:04:08.171
type gen

00:04:08.601 --> 00:04:10.201
and if you're curious where that command's being

00:04:10.201 --> 00:04:10.681
sourced from,

00:04:10.681 --> 00:04:12.601
if we come over to the package JSON,

00:04:13.741 --> 00:04:15.698
you can see that we have this script

00:04:15.777 --> 00:04:18.397
and it is basically just running wrangler types.

00:04:18.687 --> 00:04:19.087
now

00:04:19.647 --> 00:04:20.567
what happens is,

00:04:20.567 --> 00:04:23.167
if we come over to our Hono API,

00:04:23.167 --> 00:04:25.407
I have a new route here called Save id.

00:04:25.487 --> 00:04:27.447
This is going to be like an ID that we pass in.

00:04:27.447 --> 00:04:28.127
So I'm going to say

00:04:28.447 --> 00:04:28.547
await,

00:04:28.927 --> 00:04:30.927
C EMV cache

00:04:31.247 --> 00:04:34.527
and then it's going to want to have you put a key.

00:04:34.527 --> 00:04:35.727
I'm going to have a static key.

00:04:35.727 --> 00:04:36.207
This is

00:04:37.117 --> 00:04:37.357
test

00:04:38.557 --> 00:04:38.957
key.

00:04:39.837 --> 00:04:40.677
This is like,

00:04:40.677 --> 00:04:42.237
not a real like use case.

00:04:42.237 --> 00:04:43.917
This is just kind of to illustrate how to use

00:04:43.917 --> 00:04:45.197
bindings in an application.

00:04:45.197 --> 00:04:47.437
And then I'm going to also have this route that

00:04:47.437 --> 00:04:48.557
says get last id.

00:04:48.717 --> 00:04:49.117
So

00:04:49.517 --> 00:04:51.277
we're going to say ID

00:04:51.597 --> 00:04:52.237
calls

00:04:52.637 --> 00:04:53.037
C

00:04:53.527 --> 00:04:55.527
cache dot get and then the same key that we

00:04:55.527 --> 00:04:56.367
specified here.

00:04:56.527 --> 00:04:58.207
So when we run this locally,

00:04:58.810 --> 00:05:00.608
what we're going to have here is we're going to

00:05:00.608 --> 00:05:01.848
have this like

00:05:01.968 --> 00:05:04.608
this is a Hono react starter template power

00:05:04.688 --> 00:05:05.808
provided by Cloudflare.

00:05:05.968 --> 00:05:08.688
Now we're going to go over to our save ID endpoint

00:05:08.688 --> 00:05:10.048
and then we're going to pass in

00:05:12.362 --> 00:05:12.762
test

00:05:13.082 --> 00:05:14.042
ID1.

00:05:14.362 --> 00:05:16.202
So it saved test ID1.

00:05:16.362 --> 00:05:16.762
Now

00:05:17.162 --> 00:05:18.522
open this into a new tab.

00:05:18.522 --> 00:05:19.242
If we go

00:05:19.731 --> 00:05:20.771
get last id,

00:05:20.851 --> 00:05:22.291
you can see that we grabbed,

00:05:22.371 --> 00:05:24.771
the last ID that was saved in our key value store.

00:05:24.771 --> 00:05:26.051
So we hit this route,

00:05:26.211 --> 00:05:28.851
we save it in our KB and then we had this route

00:05:28.851 --> 00:05:30.731
and then we pull the last one from our kv.

00:05:30.731 --> 00:05:32.371
So if we come back over here and then I'm going to

00:05:32.371 --> 00:05:32.611
say

00:05:33.201 --> 00:05:33.441
two.

00:05:34.161 --> 00:05:35.441
So that just saved two.

00:05:35.441 --> 00:05:37.161
Now we're going to go hit this and this should be

00:05:37.161 --> 00:05:38.681
updated to 2 because this is like.

00:05:38.681 --> 00:05:40.481
So basically what we're doing is we are persisting

00:05:40.481 --> 00:05:42.081
state across different routes.

00:05:42.641 --> 00:05:44.681
This isn't a real use case for kv,

00:05:44.681 --> 00:05:46.681
but we're going to be using some very,

00:05:46.681 --> 00:05:48.841
very realistic use cases for KV throughout this

00:05:48.841 --> 00:05:49.121
course.

00:05:49.121 --> 00:05:49.521
Now,

00:05:50.121 --> 00:05:52.161
this is really all that I have to talk about in

00:05:52.161 --> 00:05:54.881
terms of how to use bindings with resources.

00:05:54.881 --> 00:05:55.641
But just note,

00:05:55.641 --> 00:05:55.961
like,

00:05:56.121 --> 00:05:58.161
every single time you see a new Cloudflare product

00:05:58.161 --> 00:05:59.161
that you're not familiar with,

00:05:59.371 --> 00:06:01.331
you can simply just go find the documentation and

00:06:01.331 --> 00:06:03.491
you can just look at the examples of how you use

00:06:03.491 --> 00:06:03.731
it.

00:06:03.731 --> 00:06:04.311
it's pretty.

00:06:04.311 --> 00:06:04.631
I mean,

00:06:04.631 --> 00:06:04.871
it's.

00:06:04.871 --> 00:06:05.151
Honestly,

00:06:05.151 --> 00:06:06.631
it's very straightforward on how to use it.

00:06:06.631 --> 00:06:08.551
I think the documentation isn't bad in terms of,

00:06:08.551 --> 00:06:08.711
like,

00:06:08.711 --> 00:06:10.271
the resources that you have access to.

00:06:10.591 --> 00:06:11.111
And then,

00:06:11.111 --> 00:06:11.511
you know,

00:06:11.511 --> 00:06:12.491
you can go through your wrangler,

00:06:12.851 --> 00:06:15.531
JSON file and it probably will just like give you

00:06:15.531 --> 00:06:18.051
like the type hints as you're building out this

00:06:18.051 --> 00:06:19.651
configuration where you don't even have to look at

00:06:19.651 --> 00:06:20.091
the docs,

00:06:20.091 --> 00:06:21.451
but if you have to look at the docs,

00:06:21.451 --> 00:06:21.851
obviously,

00:06:21.851 --> 00:06:22.011
like,

00:06:22.011 --> 00:06:23.331
all the docs are going to have

00:06:23.731 --> 00:06:24.931
examples of how to like,

00:06:24.931 --> 00:06:26.051
manage those bindings.

00:06:26.051 --> 00:06:26.851
So like,

00:06:26.851 --> 00:06:27.171
every,

00:06:27.411 --> 00:06:28.191
every single,

00:06:28.191 --> 00:06:29.531
product here will have like,

00:06:29.531 --> 00:06:30.251
examples of how

00:06:30.551 --> 00:06:30.711
them.

00:06:30.711 --> 00:06:31.031
So,

00:06:31.131 --> 00:06:31.501
that's,

00:06:31.501 --> 00:06:32.581
that's how to go through the process.

00:06:32.581 --> 00:06:34.821
You're going to become insanely familiar with this

00:06:34.821 --> 00:06:36.141
because it's really powerful.

00:06:36.141 --> 00:06:36.341
Like,

00:06:36.341 --> 00:06:37.181
if you think about it,

00:06:37.261 --> 00:06:39.741
to throw up a key value store in an application

00:06:39.741 --> 00:06:40.981
was like just one.

00:06:40.981 --> 00:06:42.781
Like it was a input form,

00:06:42.941 --> 00:06:43.821
hit submit,

00:06:43.901 --> 00:06:45.341
and then this is the code.

00:06:45.341 --> 00:06:46.861
Like one line of code to save,

00:06:46.861 --> 00:06:47.901
one line of code to get.

00:06:47.901 --> 00:06:48.581
It's really powerful.

00:06:48.581 --> 00:06:50.581
And I feel like all of the resources that I use

00:06:50.581 --> 00:06:51.861
for Cloudflare are kind of like this.

00:06:51.861 --> 00:06:52.181
I'm like,

00:06:52.181 --> 00:06:52.541
wow,

00:06:52.541 --> 00:06:54.381
that was way easier to implement than I expected.

00:06:54.381 --> 00:06:56.901
Just because you're developing in an ecosystem

00:06:56.901 --> 00:06:57.221
that,

00:06:57.221 --> 00:06:57.741
you know,

00:06:57.741 --> 00:06:58.941
has a lot of really cool products.

