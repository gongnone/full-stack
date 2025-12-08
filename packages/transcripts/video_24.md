WEBVTT
X-TIMESTAMP-MAP=LOCAL:00:00:00.000,MPEGTS:900000

00:00:00.000 --> 00:00:00.348
All right,

00:00:00.348 --> 00:00:02.988
so let's dive deeper into the advanced topics in

00:00:02.988 --> 00:00:04.428
regards to Cloudflare queues.

00:00:04.618 --> 00:00:05.448
I just want to note,

00:00:05.448 --> 00:00:07.688
before we dive too deep is the current

00:00:07.688 --> 00:00:10.168
architecture of our system is we have our data

00:00:10.168 --> 00:00:11.168
service application,

00:00:11.408 --> 00:00:13.248
and the data service application

00:00:14.048 --> 00:00:14.118
has,

00:00:14.188 --> 00:00:17.028
a Hono API and it also has a qconsumer,

00:00:17.028 --> 00:00:18.148
as you can see right here.

00:00:18.148 --> 00:00:20.388
So we have our fetch handler and then we also have

00:00:20.388 --> 00:00:21.268
a qconsumer.

00:00:21.268 --> 00:00:23.868
Each one of these are considered triggers inside

00:00:23.868 --> 00:00:24.148
of

00:00:24.448 --> 00:00:25.608
Cloudflare's ecosystem.

00:00:25.608 --> 00:00:28.408
And each trigger can invoke the worker runtime or

00:00:28.408 --> 00:00:28.998
your worker,

00:00:28.998 --> 00:00:30.028
application code.

00:00:30.428 --> 00:00:31.628
And right now,

00:00:31.628 --> 00:00:33.948
when a request comes into the Hono API,

00:00:33.948 --> 00:00:36.588
we're able to determine which route or which

00:00:36.588 --> 00:00:38.388
destination it should be routed to.

00:00:38.388 --> 00:00:40.107
And then we just simply redirect to that service.

00:00:40.107 --> 00:00:42.108
And after that redirect is done,

00:00:42.428 --> 00:00:44.348
we are sending some data onto a queue,

00:00:44.428 --> 00:00:47.108
and then that data stays on a queue and then it

00:00:47.108 --> 00:00:47.948
triggers this,

00:00:48.578 --> 00:00:49.468
queue consumer,

00:00:49.698 --> 00:00:51.978
which is still part of the same data service.

00:00:51.978 --> 00:00:54.018
And this is totally valid,

00:00:54.078 --> 00:00:56.518
a totally valid implementation within Cloudflare.

00:00:56.598 --> 00:00:56.878
Now,

00:00:56.878 --> 00:00:58.478
a lot of people kind of might think like,

00:00:58.478 --> 00:00:58.838
oh,

00:00:58.998 --> 00:01:01.158
your consumer and your producer code should be

00:01:01.158 --> 00:01:01.918
totally separate.

00:01:01.918 --> 00:01:03.158
They should be separate deployables.

00:01:03.158 --> 00:01:03.318
And,

00:01:03.318 --> 00:01:03.638
you know,

00:01:03.638 --> 00:01:04.738
that also is fine.

00:01:04.738 --> 00:01:07.098
it's a very flexible pattern from what I found.

00:01:07.098 --> 00:01:08.858
I have a lot of services that I've built for

00:01:08.858 --> 00:01:11.098
clients where we'll have like seven different

00:01:11.098 --> 00:01:11.858
backend services.

00:01:11.938 --> 00:01:13.218
They're all pretty lightweight.

00:01:13.218 --> 00:01:13.618
And,

00:01:13.938 --> 00:01:15.998
one backend service will send some data to a queue

00:01:15.998 --> 00:01:17.918
and it will be picked up by a totally separate

00:01:18.158 --> 00:01:18.718
deployable.

00:01:18.718 --> 00:01:19.118
So

00:01:19.438 --> 00:01:21.678
they don't necessarily have to live inside of the

00:01:21.678 --> 00:01:21.998
same,

00:01:22.378 --> 00:01:22.998
application.

00:01:23.478 --> 00:01:24.918
The only caveat here is,

00:01:24.918 --> 00:01:26.678
is when you're running this locally,

00:01:27.078 --> 00:01:28.878
so when you run this application locally,

00:01:28.878 --> 00:01:30.838
you say NPM run dev.

00:01:32.098 --> 00:01:34.258
you are able to basically say,

00:01:34.418 --> 00:01:35.458
the queue is,

00:01:36.078 --> 00:01:38.198
the queue right now is running locally.

00:01:38.198 --> 00:01:40.998
So all the queue data is saved inside of the data

00:01:40.998 --> 00:01:41.358
service,

00:01:41.438 --> 00:01:43.198
inside of the Wrangler folder in state.

00:01:43.278 --> 00:01:44.718
And there's going to be some like,

00:01:45.518 --> 00:01:45.798
you know,

00:01:45.798 --> 00:01:48.238
state management specifically for handling queues.

00:01:48.398 --> 00:01:50.398
So if you want to write like,

00:01:50.398 --> 00:01:52.878
actually test your consumer locally,

00:01:52.878 --> 00:01:54.358
there's kind of two ways of doing it.

00:01:54.358 --> 00:01:55.758
One is you can create a

00:01:56.078 --> 00:01:57.118
dummy API

00:01:57.518 --> 00:01:59.838
point right here that writes some data.

00:01:59.838 --> 00:02:01.918
Then you can just go to localhost and you can hit

00:02:01.918 --> 00:02:02.238
that.

00:02:02.508 --> 00:02:05.758
you can also trigger a queue through the Wrangler

00:02:05.758 --> 00:02:06.318
cli.

00:02:06.318 --> 00:02:08.238
There's some documentation for that that I'll link

00:02:08.238 --> 00:02:09.078
in this description.

00:02:09.638 --> 00:02:10.038
And,

00:02:10.268 --> 00:02:12.438
you could also technically use remote binding.

00:02:12.438 --> 00:02:13.918
So there's a lot of different things that you can

00:02:13.918 --> 00:02:14.278
do here.

00:02:14.278 --> 00:02:14.598
And

00:02:15.258 --> 00:02:16.938
I don't think that there's like one,

00:02:17.508 --> 00:02:18.178
pattern that's like,

00:02:18.178 --> 00:02:19.018
better than the other.

00:02:19.228 --> 00:02:21.468
but the only caveat here is if you have like

00:02:21.468 --> 00:02:24.348
multiple data services and you run one locally and

00:02:24.588 --> 00:02:25.588
one data service,

00:02:25.588 --> 00:02:25.988
so like,

00:02:25.988 --> 00:02:26.748
let's say you have

00:02:27.468 --> 00:02:27.498
another

00:02:27.728 --> 00:02:28.688
service over here

00:02:28.713 --> 00:02:30.664
and that service writes to this queue

00:02:30.984 --> 00:02:33.264
and the consumer lives in this service.

00:02:33.264 --> 00:02:34.584
When you run this locally,

00:02:34.744 --> 00:02:36.984
this consumer isn't actually going to be able to

00:02:36.984 --> 00:02:37.624
pick up data,

00:02:37.764 --> 00:02:38.524
running locally.

00:02:38.524 --> 00:02:40.004
Now you could do remote bindings,

00:02:40.004 --> 00:02:41.604
but remote bindings with

00:02:42.154 --> 00:02:44.474
the queue implementation can become a little bit

00:02:44.474 --> 00:02:45.194
messy because,

00:02:45.934 --> 00:02:47.894
it technically can only have one consumer.

00:02:47.894 --> 00:02:50.054
So what I typically like to do is,

00:02:50.054 --> 00:02:50.574
you know,

00:02:50.574 --> 00:02:53.774
make things really modular and then test just the

00:02:53.774 --> 00:02:54.334
handler.

00:02:54.604 --> 00:02:55.644
so just this

00:02:56.284 --> 00:02:57.724
bit of code right here,

00:02:57.776 --> 00:02:59.536
basically just this chunk right here.

00:02:59.586 --> 00:03:01.266
I like to kind of test that and

00:03:01.826 --> 00:03:03.866
not have to continuously run this thing locally.

00:03:03.866 --> 00:03:04.146
I,

00:03:04.226 --> 00:03:06.546
I find that I'm able to develop quicker if I'm not

00:03:06.546 --> 00:03:08.646
just like relying on console log statements in the

00:03:08.646 --> 00:03:09.086
terminal.

00:03:09.706 --> 00:03:12.186
but from here I just kind of want to get into a

00:03:12.186 --> 00:03:13.266
lot of the other configurations.

00:03:13.266 --> 00:03:13.666
So like,

00:03:13.666 --> 00:03:14.346
let's talk about,

00:03:14.856 --> 00:03:17.656
some producer features and then consumer features,

00:03:17.656 --> 00:03:19.238
retry dead letter and whatnot.

00:03:19.465 --> 00:03:19.865
Okay,

00:03:19.865 --> 00:03:20.905
so one of the main,

00:03:21.725 --> 00:03:24.125
consumer or one of the main producer features that

00:03:24.125 --> 00:03:24.765
I want to show

00:03:25.245 --> 00:03:26.885
is something that we're actually not going to be

00:03:26.885 --> 00:03:27.165
using.

00:03:27.245 --> 00:03:27.845
But it's,

00:03:27.845 --> 00:03:30.085
it's something that's good to know is when you

00:03:30.085 --> 00:03:30.845
send data,

00:03:31.075 --> 00:03:31.765
to your,

00:03:31.765 --> 00:03:33.205
when you send data to your

00:03:34.065 --> 00:03:34.625
queue,

00:03:35.105 --> 00:03:37.745
you can additionally pass in some options.

00:03:38.065 --> 00:03:39.585
One of the options is

00:03:40.225 --> 00:03:41.265
content type.

00:03:41.585 --> 00:03:42.625
Now content type,

00:03:42.625 --> 00:03:44.105
they have a few different valid types here.

00:03:44.105 --> 00:03:44.905
You can send bytes,

00:03:44.905 --> 00:03:45.625
you can send JSON,

00:03:45.625 --> 00:03:46.425
you can send text,

00:03:46.425 --> 00:03:47.365
you can send V8.

00:03:47.365 --> 00:03:49.805
Now because this is just like an object,

00:03:49.805 --> 00:03:51.965
it's going to be treated as JSON,

00:03:52.155 --> 00:03:52.405
which

00:03:52.805 --> 00:03:54.125
that's just going to be default.

00:03:54.125 --> 00:03:55.565
But you could in theory,

00:03:55.565 --> 00:03:57.845
if you're like processing lower level stuff,

00:03:57.995 --> 00:03:59.975
you could send over raw bytes,

00:03:59.975 --> 00:04:01.155
you could send just text.

00:04:01.605 --> 00:04:03.655
and it looks like you also have like a VA type,

00:04:03.655 --> 00:04:05.815
which I'm not entirely familiar with what this

00:04:05.815 --> 00:04:06.655
would be used for.

00:04:07.135 --> 00:04:08.575
so that's like one thing to note.

00:04:08.655 --> 00:04:11.055
And from there I think from the consumer

00:04:11.055 --> 00:04:11.615
perspective,

00:04:12.085 --> 00:04:13.355
if it's of a specific type,

00:04:13.355 --> 00:04:15.595
you might not have to parse it in a.

00:04:15.915 --> 00:04:16.515
You might like,

00:04:16.515 --> 00:04:17.995
let's say it's JSON.

00:04:18.155 --> 00:04:18.915
So for example,

00:04:18.915 --> 00:04:19.275
our

00:04:19.325 --> 00:04:20.493
consumer is looking.

00:04:20.813 --> 00:04:24.173
Our consumer doesn't actually take this and go

00:04:24.173 --> 00:04:26.933
from like a JSON string to an object.

00:04:26.933 --> 00:04:28.573
It just knows that it's an object.

00:04:28.753 --> 00:04:30.453
so that's kind of what this content type is able

00:04:30.453 --> 00:04:30.893
to do.

00:04:31.213 --> 00:04:33.533
And the thing that I find really good and really

00:04:33.533 --> 00:04:36.333
cool with the producer is you also have

00:04:36.803 --> 00:04:38.083
this delay seconds.

00:04:38.403 --> 00:04:40.483
Now this is an optional parameter now,

00:04:40.483 --> 00:04:42.483
but what you can do is I think it's like between

00:04:42.963 --> 00:04:45.963
0 seconds and 12 hours is the window that you have

00:04:45.963 --> 00:04:46.163
here.

00:04:46.163 --> 00:04:49.443
So you could basically say like I want to wait 10

00:04:49.443 --> 00:04:49.923
minutes.

00:04:50.993 --> 00:04:52.683
and this is 10 minutes and seconds.

00:04:52.683 --> 00:04:53.643
And you.

00:04:53.803 --> 00:04:54.283
What is,

00:04:54.283 --> 00:04:55.723
what happens is that data

00:04:56.283 --> 00:04:58.563
goes to the queue but isn't actually processed by

00:04:58.563 --> 00:05:01.483
the consumer until this time hits that threshold.

00:05:01.483 --> 00:05:03.403
And I find this really useful for a lot of

00:05:03.403 --> 00:05:04.203
different use cases.

00:05:04.203 --> 00:05:06.123
Like one of the scenarios is,

00:05:06.503 --> 00:05:09.463
when using the Twilio Twilio API to send SMS

00:05:09.463 --> 00:05:10.103
texts,

00:05:10.313 --> 00:05:13.113
what you can do is you can basically send a text

00:05:13.273 --> 00:05:15.593
and then you get a Twilio id and then I go and

00:05:15.593 --> 00:05:16.713
stick a Twilio id,

00:05:17.123 --> 00:05:19.773
inside of the data of a queue and then I say wait

00:05:19.773 --> 00:05:20.413
10 minutes.

00:05:20.653 --> 00:05:22.453
And the reason why I want to wait 10 minutes is

00:05:22.453 --> 00:05:23.253
because Twilio,

00:05:23.253 --> 00:05:23.613
like

00:05:23.933 --> 00:05:26.933
within a few minutes that message should arrive by

00:05:26.933 --> 00:05:27.453
the user.

00:05:27.453 --> 00:05:29.413
And then if you call the API again you can check

00:05:29.413 --> 00:05:32.413
like if the message was delivered or if it failed,

00:05:32.413 --> 00:05:33.293
or if it's

00:05:33.643 --> 00:05:34.243
just been sent.

00:05:34.243 --> 00:05:34.603
Right.

00:05:35.003 --> 00:05:36.283
So from here I just add,

00:05:36.283 --> 00:05:36.443
like,

00:05:36.443 --> 00:05:37.563
an arbitrary delay,

00:05:37.963 --> 00:05:39.243
check it in 10 minutes,

00:05:39.243 --> 00:05:41.363
and the consumer basically just calls the API,

00:05:41.363 --> 00:05:42.083
gets that data,

00:05:42.083 --> 00:05:42.843
keeps track of,

00:05:42.843 --> 00:05:43.163
like,

00:05:43.163 --> 00:05:44.163
what has been delivered,

00:05:44.163 --> 00:05:45.443
what hasn't delivered and whatnot.

00:05:45.443 --> 00:05:46.963
So that's a valid use case for this.

00:05:46.963 --> 00:05:48.403
There's a lot of different reasons why you might

00:05:48.403 --> 00:05:49.003
want to add some,

00:05:49.003 --> 00:05:49.243
like,

00:05:49.243 --> 00:05:50.363
delay when you send.

00:05:50.363 --> 00:05:52.403
But it's just one cool feature that Cloudflare has

00:05:52.403 --> 00:05:54.923
kind of baked into the producer side of things.

00:05:55.071 --> 00:05:57.471
Now the consumer is where you have a lot

00:05:57.661 --> 00:05:59.991
of flexibility around how to configure things

00:05:59.991 --> 00:06:02.671
specifically for a use case or your use case that

00:06:02.671 --> 00:06:03.511
you're implementing.

00:06:03.511 --> 00:06:06.911
So this is our consumer and if we head over to the

00:06:06.911 --> 00:06:07.511
wrangler

00:06:07.911 --> 00:06:08.471
JSON

00:06:08.801 --> 00:06:09.591
C file,

00:06:09.751 --> 00:06:11.551
we're going to notice right now the only thing

00:06:11.551 --> 00:06:13.831
that we've passed into this consumer is

00:06:14.001 --> 00:06:14.811
a queue name.

00:06:14.891 --> 00:06:16.491
But you also have a few different

00:06:17.131 --> 00:06:18.091
props or

00:06:19.221 --> 00:06:20.751
variables that you can configure here.

00:06:20.991 --> 00:06:23.191
And we'll kind of talk through a few of these.

00:06:23.191 --> 00:06:23.671
So like,

00:06:23.671 --> 00:06:26.431
the first one that I want to look at is the

00:06:26.851 --> 00:06:27.891
max retries.

00:06:28.291 --> 00:06:28.691
So

00:06:29.411 --> 00:06:30.771
essentially by default,

00:06:31.101 --> 00:06:32.551
Q is going to retry three times.

00:06:32.551 --> 00:06:34.351
Meaning if your logic here

00:06:34.751 --> 00:06:36.111
fails for whatever reason,

00:06:36.511 --> 00:06:39.631
it's going to retry three times until that

00:06:39.901 --> 00:06:42.061
it's going to retry three times until it basically

00:06:42.061 --> 00:06:43.261
just throws that message away.

00:06:43.661 --> 00:06:45.941
And this could be useful if like you rely on an

00:06:45.941 --> 00:06:48.441
external API and that API goes down for just a

00:06:48.441 --> 00:06:48.681
second

00:06:49.001 --> 00:06:49.401
and

00:06:49.881 --> 00:06:51.481
you still want to process that data,

00:06:51.561 --> 00:06:53.721
it'll just automatically retry it for you.

00:06:53.721 --> 00:06:55.881
Now there might be scenarios where you don't want

00:06:55.881 --> 00:06:56.481
to retry.

00:06:56.481 --> 00:06:59.601
Like if you are sending data to an LLM and it's

00:06:59.601 --> 00:07:00.401
really really expensive,

00:07:00.401 --> 00:07:02.441
or like image generation and it's really really

00:07:02.441 --> 00:07:02.921
expensive,

00:07:03.161 --> 00:07:05.321
you might not want some scenario where your

00:07:05.321 --> 00:07:08.201
application code fails and you continuously ping

00:07:08.201 --> 00:07:10.201
that API and like rack up all this money,

00:07:10.291 --> 00:07:11.571
and your code gets stuck.

00:07:11.571 --> 00:07:13.011
So this is kind of where

00:07:13.101 --> 00:07:14.471
depending on what type of use case you're

00:07:14.471 --> 00:07:16.471
implementing at the consumer level,

00:07:16.471 --> 00:07:18.631
you can basically say how many times you want to

00:07:18.631 --> 00:07:18.911
ret.

00:07:19.531 --> 00:07:20.571
So we're not gonna,

00:07:20.571 --> 00:07:22.331
we're just gonna keep the default for this use

00:07:22.331 --> 00:07:23.131
case right now.

00:07:23.371 --> 00:07:25.931
But if you did set like let's say you said five

00:07:25.931 --> 00:07:26.171
times,

00:07:26.171 --> 00:07:28.001
I'm gonna retry five times is your

00:07:28.231 --> 00:07:28.871
logic.

00:07:28.951 --> 00:07:29.751
You could also

00:07:30.071 --> 00:07:31.111
provide a

00:07:31.511 --> 00:07:31.541
retry

00:07:31.931 --> 00:07:32.411
delay.

00:07:32.411 --> 00:07:35.171
So you could basically say how long in between

00:07:35.171 --> 00:07:36.451
each time it retries.

00:07:36.451 --> 00:07:37.531
Do you want that to be.

00:07:37.611 --> 00:07:39.931
So that's one value that's like pretty cool here.

00:07:40.731 --> 00:07:42.651
And then the thing that we're going to be using

00:07:42.731 --> 00:07:43.371
the most,

00:07:43.371 --> 00:07:43.771
or

00:07:44.091 --> 00:07:47.411
at least using as part of this course is the dead

00:07:47.411 --> 00:07:48.091
letter Q.

00:07:48.461 --> 00:07:49.991
and essentially what this is saying is

00:07:50.371 --> 00:07:50.931
saying if

00:07:51.651 --> 00:07:53.891
we retry until we hit that threshold

00:07:55.571 --> 00:07:57.331
and this event is just going to fail,

00:07:57.331 --> 00:07:59.011
we're not going to process it anymore.

00:07:59.171 --> 00:08:01.091
If you configure a dead letter queue,

00:08:01.171 --> 00:08:03.891
it'll send that data onto a dead letter queue so

00:08:03.891 --> 00:08:05.783
you can manage those failed events separately.

00:08:05.957 --> 00:08:08.237
So let's quickly head over to the Cloudflare

00:08:08.237 --> 00:08:10.437
dashboard and let's create a dead letter queue.

00:08:10.597 --> 00:08:12.437
So if we head over here,

00:08:12.437 --> 00:08:13.317
let's go to

00:08:13.637 --> 00:08:14.917
storage and databases,

00:08:15.317 --> 00:08:17.916
let's go to queues and I'm going to create a new

00:08:17.916 --> 00:08:18.397
queue here.

00:08:18.397 --> 00:08:19.397
So I'm going to call this

00:08:19.867 --> 00:08:20.817
smart links

00:08:21.777 --> 00:08:23.057
dead letter,

00:08:24.647 --> 00:08:25.157
stage,

00:08:25.557 --> 00:08:27.815
because this is just lower environment for now

00:08:28.419 --> 00:08:29.539
we can create that queue.

00:08:30.579 --> 00:08:33.499
And then what I'm going to immediately do is I'm

00:08:33.499 --> 00:08:34.499
going to come into here,

00:08:34.579 --> 00:08:35.859
I'm going to go to messages

00:08:36.499 --> 00:08:38.099
and I am going to

00:08:38.499 --> 00:08:41.299
have the status to be paused because I want,

00:08:41.299 --> 00:08:41.939
I don't want

00:08:42.339 --> 00:08:45.259
any data to be actually processed when it arrives

00:08:45.259 --> 00:08:46.579
to the queue for the time being.

00:08:47.379 --> 00:08:48.939
So we're going to head over here,

00:08:48.939 --> 00:08:50.419
we're going to basically say here's our dead

00:08:50.419 --> 00:08:51.059
letter queue

00:08:51.539 --> 00:08:52.099
and then

00:08:52.759 --> 00:08:55.199
we can head over into our index TS file and then

00:08:55.199 --> 00:08:57.639
we're going to intentionally throw an error here

00:08:57.719 --> 00:09:00.119
so we can comment out this code for now.

00:09:00.199 --> 00:09:01.239
And then let's just

00:09:03.699 --> 00:09:04.899
throw new

00:09:05.219 --> 00:09:08.179
error and we'll just say test error.

00:09:08.499 --> 00:09:09.059
Okay,

00:09:09.619 --> 00:09:11.219
so we can PNPM run,

00:09:11.219 --> 00:09:12.099
deploy this.

00:09:13.873 --> 00:09:16.113
Now if we head over to

00:09:16.833 --> 00:09:17.233
our

00:09:17.873 --> 00:09:18.233
link,

00:09:18.233 --> 00:09:19.233
so I have one saved here,

00:09:19.233 --> 00:09:21.633
I'm just going to say this is our data service.

00:09:22.433 --> 00:09:23.793
This should trigger that queue.

00:09:23.793 --> 00:09:25.553
We just did a redirect and

00:09:25.933 --> 00:09:29.353
instead of that data actually flowing into the

00:09:29.353 --> 00:09:29.713
table,

00:09:29.713 --> 00:09:31.313
because right now we're saving the link click

00:09:31.313 --> 00:09:31.713
table.

00:09:31.873 --> 00:09:34.273
What we're going to notice is if we come over to

00:09:34.273 --> 00:09:34.593
our

00:09:35.503 --> 00:09:38.623
we come over to our dead letter queue and we go to

00:09:38.623 --> 00:09:38.943
list,

00:09:39.103 --> 00:09:40.383
we should have some data

00:09:40.523 --> 00:09:41.843
that ends up in this queue.

00:09:41.843 --> 00:09:42.323
Message

00:09:42.723 --> 00:09:43.043
now.

00:09:43.043 --> 00:09:44.883
Right now we're not doing anything with

00:09:45.203 --> 00:09:47.203
the data inside of

00:09:47.383 --> 00:09:48.003
this queue.

00:09:48.403 --> 00:09:49.683
We are just simply like,

00:09:49.683 --> 00:09:51.043
it's just simply being stored here.

00:09:51.043 --> 00:09:54.003
Now this is kind of where dead letter or like

00:09:54.003 --> 00:09:56.283
failed event processing becomes more advanced

00:09:56.283 --> 00:09:58.123
because there's so many different routes that you

00:09:58.123 --> 00:09:58.643
can go.

00:09:58.883 --> 00:09:59.443
You could,

00:09:59.443 --> 00:10:01.043
and this is what we're going to do for now

00:10:01.583 --> 00:10:01.823
is

00:10:02.707 --> 00:10:05.827
you could just basically say I'm going to

00:10:06.485 --> 00:10:08.065
make another consumer here

00:10:09.136 --> 00:10:11.496
and it's going to be consuming from the dead

00:10:11.496 --> 00:10:12.176
letter queue.

00:10:12.176 --> 00:10:14.016
And then we're basically just going to say

00:10:14.336 --> 00:10:16.496
we're going to do a number of retries.

00:10:16.496 --> 00:10:18.256
We'll just call it zero for now.

00:10:18.496 --> 00:10:20.296
So now this has two consumers.

00:10:20.296 --> 00:10:22.365
And then inside of your application logic,

00:10:22.365 --> 00:10:24.777
whenever you receive a batch of events,

00:10:25.237 --> 00:10:28.397
the batch is going to be a batch specifically from

00:10:28.397 --> 00:10:28.997
a queue.

00:10:28.997 --> 00:10:31.317
So this queue is going to be,

00:10:31.339 --> 00:10:33.348
this queue is going to be the name of the queue

00:10:33.428 --> 00:10:34.868
that we have inside of our

00:10:35.528 --> 00:10:36.688
wrangler JSON C.

00:10:36.688 --> 00:10:38.448
So it's either going to be this

00:10:39.008 --> 00:10:39.098
smart

00:10:39.267 --> 00:10:41.348
link stated queue or the dead letter queue.

00:10:41.348 --> 00:10:44.228
So if you wanted to segment the processing logic,

00:10:44.228 --> 00:10:45.828
depending on if it's a

00:10:46.148 --> 00:10:47.628
failed message or not,

00:10:47.628 --> 00:10:49.228
or if it's coming from a dead letter queue,

00:10:49.228 --> 00:10:50.228
you could do it this way.

00:10:50.468 --> 00:10:52.748
You could also create an entirely separate

00:10:52.748 --> 00:10:53.108
service,

00:10:53.818 --> 00:10:55.818
that is that implements a queue handler

00:10:56.778 --> 00:10:58.978
that only processes dead letter queues as well if

00:10:58.978 --> 00:10:59.658
you wanted to,

00:10:59.658 --> 00:11:00.298
depending on

00:11:00.608 --> 00:11:01.278
your use case.

00:11:01.358 --> 00:11:02.998
Now for us we're not really going to have to

00:11:02.998 --> 00:11:04.158
distinguish between the two.

00:11:04.158 --> 00:11:06.598
We're just going to have that data get parked onto

00:11:06.598 --> 00:11:09.038
that queue and then it's going to be configured

00:11:09.038 --> 00:11:09.677
into here.

00:11:09.838 --> 00:11:10.076
So

00:11:10.076 --> 00:11:10.933
it's going to be configured.

00:11:10.933 --> 00:11:11.613
So basically

00:11:11.823 --> 00:11:14.933
any of these failed events they can end up back,

00:11:15.083 --> 00:11:16.913
in this dead letter queue and then we can go

00:11:16.913 --> 00:11:19.073
toggle the dead letter queue from pause back to

00:11:19.073 --> 00:11:19.513
resume.

00:11:19.513 --> 00:11:20.713
If we want to process this,

00:11:21.093 --> 00:11:21.573
process them.

00:11:21.573 --> 00:11:22.613
So it's just very simpler,

00:11:22.693 --> 00:11:23.973
simple handling for now.

00:11:24.053 --> 00:11:25.333
But just know that you can,

00:11:25.333 --> 00:11:25.693
you know,

00:11:25.693 --> 00:11:27.013
build a very advanced system

00:11:27.193 --> 00:11:29.273
and workflow on top of these features.

00:11:29.593 --> 00:11:33.113
So I'm going to head back to our index ts,

00:11:33.353 --> 00:11:34.073
go ahead and

00:11:34.633 --> 00:11:35.744
uncomment this guy

00:11:36.743 --> 00:11:37.143
and

00:11:38.921 --> 00:11:40.841
we can go ahead and deploy one more time.

00:11:42.320 --> 00:11:43.520
And if we look at our

00:11:43.840 --> 00:11:44.800
SQL table,

00:11:44.800 --> 00:11:47.760
so I'm just going to head over to our SQL table

00:11:47.827 --> 00:11:48.943
and I'm going to select

00:11:49.583 --> 00:11:49.983
star

00:11:50.383 --> 00:11:51.983
from link clicks.

00:11:52.225 --> 00:11:54.141
So you can see we only have two records in here.

00:11:54.301 --> 00:11:55.821
If we look at our queue

00:11:56.541 --> 00:11:58.541
we have two records that are pending.

00:11:58.541 --> 00:12:00.621
Our deployment has successfully went through.

00:12:01.101 --> 00:12:02.301
So when I resume this,

00:12:02.646 --> 00:12:04.886
our consumer should now pick that up.

00:12:06.246 --> 00:12:08.926
we shouldn't have any more inside of our messages

00:12:08.926 --> 00:12:11.126
that are in that queue for this dead letter queue.

00:12:11.286 --> 00:12:12.926
And then if we run this query again,

00:12:12.926 --> 00:12:14.966
we should see that we have four entries into here.

00:12:14.966 --> 00:12:16.686
So you can see that now we processed all that

00:12:16.686 --> 00:12:16.966
data.

00:12:17.046 --> 00:12:19.726
So this flow was basically process some data,

00:12:19.726 --> 00:12:20.406
it failed,

00:12:20.406 --> 00:12:21.846
it got sent to a dead letter queue,

00:12:21.846 --> 00:12:23.366
that dead letter queue was paused.

00:12:23.366 --> 00:12:25.686
So like that the data wasn't processed.

00:12:25.846 --> 00:12:26.566
We then

00:12:27.226 --> 00:12:29.066
in this scenario imagine like you have some

00:12:29.066 --> 00:12:29.786
service outage,

00:12:29.786 --> 00:12:30.026
right?

00:12:30.026 --> 00:12:32.506
You go like ensure that the issue is resolved,

00:12:32.506 --> 00:12:33.386
everything's fixed,

00:12:33.986 --> 00:12:35.186
resumed and working as expected.

00:12:35.506 --> 00:12:38.626
Then you head back over to your queue and you hit

00:12:38.626 --> 00:12:39.346
resume.

00:12:39.426 --> 00:12:41.466
So what I like to do for these dead letter queue

00:12:41.466 --> 00:12:44.226
setups is I just like keep it paused at all times

00:12:44.546 --> 00:12:46.826
and then if I ever get data onto this queue,

00:12:46.826 --> 00:12:49.465
I kind of on a case by case basis figure out how

00:12:49.465 --> 00:12:50.226
to process it,

00:12:50.226 --> 00:12:52.506
but it really just depends on your workload.

00:12:52.506 --> 00:12:55.306
So this is another like advanced feature and the

00:12:55.306 --> 00:12:56.506
routes that you can go are endless.

00:12:56.506 --> 00:12:57.906
But just note it's really cool.

00:12:57.906 --> 00:12:59.556
And you can build some like really,

00:12:59.706 --> 00:13:01.666
really production ready systems on top of just

00:13:01.666 --> 00:13:03.946
these very simple primitives and configurations.

