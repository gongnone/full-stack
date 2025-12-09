WEBVTT
X-TIMESTAMP-MAP=LOCAL:00:00:00.000,MPEGTS:900000

00:00:00.066 --> 00:00:00.466
All right,

00:00:00.546 --> 00:00:04.426
so now that we have a qconsumer created and we

00:00:04.426 --> 00:00:05.906
have our queue created,

00:00:05.906 --> 00:00:08.026
let's go ahead and build out the logic for the

00:00:08.026 --> 00:00:10.826
producer so we can actually send messages to the

00:00:10.826 --> 00:00:13.906
queue so they can be processed by this consumer.

00:00:14.466 --> 00:00:16.386
So right now we are in our data service

00:00:17.266 --> 00:00:20.866
project inside of our Monorepo and we have our

00:00:20.866 --> 00:00:21.586
Hono app,

00:00:21.586 --> 00:00:23.106
so our app TS file.

00:00:23.386 --> 00:00:23.506
Now,

00:00:23.506 --> 00:00:26.186
the only route that we have here right now is the

00:00:26.266 --> 00:00:28.026
Smart link router,

00:00:28.026 --> 00:00:30.506
which basically says whenever we get a link click,

00:00:30.586 --> 00:00:32.986
we're able to figure out the destination that that

00:00:32.986 --> 00:00:34.266
link click should be routed to.

00:00:34.266 --> 00:00:37.106
And then we redirect the user to that intended

00:00:37.106 --> 00:00:37.706
destination.

00:00:38.436 --> 00:00:38.866
from here,

00:00:38.866 --> 00:00:40.706
what we want to do is we want to capture that link

00:00:40.706 --> 00:00:41.186
click data,

00:00:41.186 --> 00:00:43.146
and then we want to save it in the back in our

00:00:43.146 --> 00:00:44.706
backend service so we can,

00:00:44.706 --> 00:00:45.226
you know,

00:00:45.226 --> 00:00:46.466
power different features,

00:00:47.056 --> 00:00:48.816
as part of this entire SaaS offering.

00:00:49.126 --> 00:00:49.366
Now,

00:00:49.366 --> 00:00:52.246
we could collect that data here and then save it

00:00:52.246 --> 00:00:54.566
and store it inside of this request.

00:00:54.646 --> 00:00:56.686
But what we want to do is we want to ensure that

00:00:56.686 --> 00:00:58.966
this operation happens as fast as possible.

00:00:59.206 --> 00:00:59.606
So

00:01:00.086 --> 00:01:02.086
essentially we're going to offload that data to a

00:01:02.086 --> 00:01:04.206
queue so it can be processed by an entirely

00:01:04.206 --> 00:01:05.125
separate process.

00:01:05.446 --> 00:01:05.846
And,

00:01:06.006 --> 00:01:09.046
this link redirect logic can just remain as snappy

00:01:09.046 --> 00:01:09.526
as possible.

00:01:09.846 --> 00:01:11.966
So what we're going to do is we're going to head

00:01:11.966 --> 00:01:14.326
over to our Wrangler JSON C file in our data

00:01:14.326 --> 00:01:15.046
service project,

00:01:15.846 --> 00:01:18.246
we are going to go ahead and add a producer.

00:01:18.326 --> 00:01:20.406
So if we add our producers,

00:01:21.686 --> 00:01:23.406
we all we have to do is we need to give it a

00:01:23.406 --> 00:01:23.926
binding.

00:01:24.006 --> 00:01:25.366
So I'm going to say queue.

00:01:25.446 --> 00:01:27.526
This is the object that we're going to use to

00:01:27.526 --> 00:01:28.486
access the queue

00:01:28.806 --> 00:01:31.206
and then we're going to pass in our name.

00:01:31.526 --> 00:01:33.206
So it's going to be the same name as here.

00:01:34.646 --> 00:01:35.926
And this is our queue name.

00:01:36.086 --> 00:01:36.886
So this,

00:01:37.046 --> 00:01:39.526
this basically tells our producer that the data

00:01:39.526 --> 00:01:41.846
that is going to be sent when calling this queue

00:01:41.846 --> 00:01:42.726
binding is,

00:01:43.036 --> 00:01:45.116
should arrive on this specific queue.

00:01:45.826 --> 00:01:46.936
I'm going to go ahead and run

00:01:47.256 --> 00:01:48.096
pmpm,

00:01:48.096 --> 00:01:49.016
run CF

00:01:49.336 --> 00:01:50.136
type jet

00:01:51.291 --> 00:01:53.377
and that's going to generate this queue type.

00:01:53.377 --> 00:01:55.457
And if we head over to our worker configuration,

00:01:55.457 --> 00:01:57.337
you're going to see we now have this queue binding

00:01:57.337 --> 00:01:58.577
of the type Q.

00:01:58.688 --> 00:02:00.494
So let's head over to our app TS

00:02:00.494 --> 00:02:02.009
and you're going to be able to see if we access

00:02:02.009 --> 00:02:03.049
our bindings here.

00:02:03.289 --> 00:02:04.969
We now have a Q object

00:02:05.289 --> 00:02:06.369
that has two methods.

00:02:06.369 --> 00:02:06.529
We,

00:02:06.599 --> 00:02:08.199
we have a send and we have a send batch.

00:02:08.279 --> 00:02:09.279
When we call send,

00:02:09.279 --> 00:02:11.239
we're basically just sending one event to the

00:02:11.239 --> 00:02:12.599
Queue for further processing.

00:02:12.919 --> 00:02:16.119
Send batch is going to take an array of events

00:02:16.519 --> 00:02:18.239
and essentially those are also going to be

00:02:18.239 --> 00:02:19.879
processed in like the same batch.

00:02:19.879 --> 00:02:21.879
But the reason why you'd want to use this is

00:02:22.119 --> 00:02:24.679
imagine you pull some data from like your database

00:02:24.679 --> 00:02:26.399
or something and you have a whole bunch of data

00:02:26.399 --> 00:02:28.639
and you don't want to like iterate over that data

00:02:28.639 --> 00:02:30.279
and send a thousand different,

00:02:30.609 --> 00:02:32.569
a thousand different events to the queue

00:02:32.569 --> 00:02:33.169
individually.

00:02:33.689 --> 00:02:35.649
What you can do is you can like send batches of 50

00:02:35.649 --> 00:02:37.209
or batches of 100 events.

00:02:37.329 --> 00:02:39.629
and that's going to basically make your operation

00:02:39.629 --> 00:02:39.869
much,

00:02:39.869 --> 00:02:40.109
much,

00:02:40.109 --> 00:02:40.749
much faster.

00:02:40.989 --> 00:02:42.709
And then you're not going to hit any type of like

00:02:42.709 --> 00:02:44.949
request limit where the worker runtime.

00:02:44.949 --> 00:02:46.869
If you're making these sub requests to a separate

00:02:46.869 --> 00:02:47.109
service,

00:02:47.109 --> 00:02:48.429
you only can make a thousand of them.

00:02:48.429 --> 00:02:49.549
That mean 1000 is a lot.

00:02:49.549 --> 00:02:51.509
But this just basically makes things more

00:02:51.509 --> 00:02:52.029
efficient.

00:02:52.309 --> 00:02:54.829
it is like less IO that's needed for your

00:02:54.829 --> 00:02:55.389
application,

00:02:55.629 --> 00:02:57.629
less opportunity for issues to come up.

00:02:57.949 --> 00:02:58.509
and then it's just,

00:02:58.509 --> 00:02:58.869
you know,

00:02:58.869 --> 00:02:59.269
faster.

00:02:59.269 --> 00:03:00.949
So that's what Send batch is going to do.

00:03:00.949 --> 00:03:02.789
But for now what we're going to do is we're

00:03:02.789 --> 00:03:03.778
basically going to say

00:03:04.608 --> 00:03:05.088
await

00:03:05.728 --> 00:03:07.248
c EMB Q

00:03:08.793 --> 00:03:10.633
and then we're going to send an event.

00:03:11.193 --> 00:03:13.433
Now the data that we want to capture,

00:03:13.673 --> 00:03:15.693
is going to be of the type link,

00:03:15.693 --> 00:03:16.852
click message type,

00:03:17.013 --> 00:03:19.173
which is something we've actually have defined

00:03:19.253 --> 00:03:20.453
inside of our

00:03:20.853 --> 00:03:22.213
DataOps package.

00:03:22.613 --> 00:03:25.893
So inside of our data Ops package in the Mono repo

00:03:25.973 --> 00:03:27.333
we have this type.

00:03:27.413 --> 00:03:29.013
So I'm going to go ahead and import it.

00:03:29.013 --> 00:03:30.453
So what I'm going to do is I'm going to say

00:03:31.523 --> 00:03:32.403
queue message

00:03:33.443 --> 00:03:34.483
is of the type,

00:03:34.866 --> 00:03:36.068
link click message type

00:03:36.068 --> 00:03:37.892
which is coming from our package that we have

00:03:37.892 --> 00:03:38.227
built.

00:03:38.227 --> 00:03:38.816
And then

00:03:39.216 --> 00:03:40.496
we're going to say equals.

00:03:40.732 --> 00:03:42.366
This is going to be of the type

00:03:44.206 --> 00:03:44.606
link,

00:03:44.606 --> 00:03:45.086
click.

00:03:45.406 --> 00:03:47.806
And I'm going to go ahead and go to our backend

00:03:47.806 --> 00:03:49.326
service really quick just so you can,

00:03:49.566 --> 00:03:50.926
you know or not our backend service,

00:03:50.926 --> 00:03:51.406
our data,

00:03:51.526 --> 00:03:52.436
data ops package.

00:03:52.436 --> 00:03:54.316
So you can see where this is coming from in just a

00:03:54.316 --> 00:03:54.556
second.

00:03:55.126 --> 00:03:57.006
But first what we're going to do is we're actually

00:03:57.006 --> 00:04:00.366
going to add the data that's necessary for sending

00:04:00.366 --> 00:04:01.046
to our queue.

00:04:01.046 --> 00:04:02.726
So we're going to want an id,

00:04:03.446 --> 00:04:04.966
we're going to want a country.

00:04:05.140 --> 00:04:06.400
This is the country code,

00:04:06.480 --> 00:04:06.990
from the,

00:04:06.990 --> 00:04:08.096
basically from the user.

00:04:08.407 --> 00:04:10.031
I think this is going to come from

00:04:10.031 --> 00:04:10.683
destination.

00:04:12.084 --> 00:04:13.844
We're going to want the

00:04:14.904 --> 00:04:15.484
let's see,

00:04:15.820 --> 00:04:19.340
this is actually coming from our header.

00:04:19.340 --> 00:04:20.540
So from our headers

00:04:21.180 --> 00:04:23.100
we can say I want the country,

00:04:23.740 --> 00:04:25.500
we also need to provide the destination.

00:04:25.820 --> 00:04:27.940
So the actual link that this is supposed to be

00:04:27.940 --> 00:04:28.620
routed to

00:04:29.260 --> 00:04:30.820
so we can say destin.

00:04:30.820 --> 00:04:31.170
Actually

00:04:31.170 --> 00:04:32.820
what I want to do is I want to make sure these are

00:04:32.820 --> 00:04:33.620
not in strings.

00:04:33.780 --> 00:04:34.420
Destination

00:04:34.950 --> 00:04:38.230
going to route to our actual destination URL

00:04:38.710 --> 00:04:41.950
and then we're also going to be providing an

00:04:41.950 --> 00:04:42.710
account ID

00:04:43.430 --> 00:04:45.590
which is coming from our link info data.

00:04:47.020 --> 00:04:47.607
Additionally,

00:04:47.607 --> 00:04:49.087
where you want the latitude,

00:04:49.577 --> 00:04:51.107
which is coming from our headers

00:04:52.627 --> 00:04:55.827
and we want the longitude which is also coming

00:04:55.827 --> 00:04:57.347
from our headers.

00:05:00.428 --> 00:05:01.468
And lastly,

00:05:01.868 --> 00:05:04.588
I'm just going to stick a timestamp in here

00:05:05.468 --> 00:05:08.348
just so we're able to track when this specific

00:05:08.348 --> 00:05:09.508
operation happens.

00:05:09.508 --> 00:05:10.508
So I'm going to say to

00:05:10.828 --> 00:05:12.108
ISO string

00:05:12.837 --> 00:05:15.917
now we are going to pass the Q message into the

00:05:15.917 --> 00:05:16.437
send

00:05:17.067 --> 00:05:17.627
method

00:05:18.027 --> 00:05:21.347
and essentially from here that data is going to

00:05:21.347 --> 00:05:23.627
successfully route to our queue and we're going to

00:05:23.627 --> 00:05:25.347
deploy and test it just so we can make sure

00:05:25.347 --> 00:05:26.647
everything's on the up and up.

00:05:26.887 --> 00:05:30.047
But one last thing to note is this operation is

00:05:30.047 --> 00:05:32.607
going to take a few milliseconds to basically send

00:05:32.607 --> 00:05:34.247
the data to the queue and then get an

00:05:34.247 --> 00:05:37.047
acknowledgement back from the queue that it has

00:05:37.047 --> 00:05:38.887
successfully made it to the queue.

00:05:38.887 --> 00:05:41.527
Now we don't want to wait for this IO

00:05:41.847 --> 00:05:42.247
before

00:05:42.567 --> 00:05:43.767
we actually redirect.

00:05:44.007 --> 00:05:46.527
So what we're going to do is we can copy that and

00:05:46.527 --> 00:05:47.687
then we're going to say C

00:05:48.407 --> 00:05:50.767
execution context and then we're going to access a

00:05:50.767 --> 00:05:51.927
cloudflare specific

00:05:52.567 --> 00:05:52.607
runtime

00:05:53.107 --> 00:05:53.467
feature

00:05:53.757 --> 00:05:54.557
which is wait until,

00:05:54.957 --> 00:05:57.317
which basically says you can run some like

00:05:57.317 --> 00:05:58.637
asynchronous task

00:05:58.957 --> 00:06:01.717
after redirect happens or after your request is

00:06:01.717 --> 00:06:02.317
fulfilled

00:06:02.717 --> 00:06:05.437
and you have up to 30 seconds to basically

00:06:05.997 --> 00:06:09.037
ensure that this worker stays running to complete

00:06:09.037 --> 00:06:09.277
something.

00:06:09.277 --> 00:06:11.197
And you know this operation's only going to take

00:06:11.517 --> 00:06:12.717
a few milliseconds.

00:06:12.797 --> 00:06:16.477
So the only caveat here is it no longer has to be

00:06:16.647 --> 00:06:17.937
we no longer have to await it.

00:06:18.177 --> 00:06:20.417
So all we're doing is we're saying let's go ahead

00:06:20.417 --> 00:06:24.177
and wait for the queue sending method to,

00:06:24.327 --> 00:06:26.487
to finish before we close out the worker.

00:06:26.647 --> 00:06:28.887
But this is going to be bypassed,

00:06:28.887 --> 00:06:31.567
this is going to redirect to the user and then on

00:06:31.567 --> 00:06:33.887
the background we're going to be able to send this

00:06:33.887 --> 00:06:34.807
data to the queue.

00:06:34.887 --> 00:06:37.647
Now this isn't 100% fail safe.

00:06:37.647 --> 00:06:38.567
There are very,

00:06:39.367 --> 00:06:41.367
very unlikely edge cases that would

00:06:41.687 --> 00:06:42.207
make it.

00:06:42.207 --> 00:06:44.127
So this method actually doesn't complete

00:06:44.127 --> 00:06:44.887
successfully.

00:06:44.967 --> 00:06:45.367
But

00:06:45.507 --> 00:06:46.767
the worker closes down.

00:06:46.767 --> 00:06:47.327
It's very,

00:06:47.327 --> 00:06:47.967
very rare.

00:06:48.287 --> 00:06:50.487
So if you have like insanely critical data,

00:06:50.487 --> 00:06:50.847
like

00:06:51.467 --> 00:06:52.427
transaction data,

00:06:52.667 --> 00:06:54.667
financial data data where you can have.

00:06:54.747 --> 00:06:55.147
No,

00:06:55.307 --> 00:06:55.747
you know,

00:06:55.747 --> 00:06:55.947
like,

00:06:55.947 --> 00:06:57.627
there's no leeway in losing that data.

00:06:57.787 --> 00:06:59.707
I don't know if I would necessarily use this,

00:06:59.707 --> 00:07:00.467
but other than that,

00:07:00.467 --> 00:07:01.587
this is really great for,

00:07:01.587 --> 00:07:01.787
like,

00:07:01.787 --> 00:07:04.267
analytic based things where you just need to stick

00:07:04.267 --> 00:07:04.587
data,

00:07:04.627 --> 00:07:05.187
somewhere,

00:07:05.187 --> 00:07:05.424
so.

00:07:06.305 --> 00:07:09.305
So now that we have this producer set up and we're

00:07:09.305 --> 00:07:11.185
able to send data to a queue,

00:07:11.185 --> 00:07:12.545
we're going to go ahead and deploy,

00:07:13.025 --> 00:07:15.265
just make sure everything is working as expected.

00:07:15.505 --> 00:07:16.545
So data,

00:07:16.625 --> 00:07:19.185
when we click on a link that gets redirected,

00:07:19.265 --> 00:07:20.065
we shouldn't.

00:07:20.065 --> 00:07:21.345
This should execute,

00:07:21.505 --> 00:07:23.865
it should be written to a queue and then it should

00:07:23.865 --> 00:07:25.905
be logged out right here.

00:07:26.145 --> 00:07:27.745
So I'm going to say pmpm,

00:07:28.685 --> 00:07:28.925
run,

00:07:29.165 --> 00:07:29.805
deploy.

00:07:31.055 --> 00:07:33.135
And we're going to notice there's going to be an

00:07:33.135 --> 00:07:35.895
additional binding that our application has access

00:07:35.895 --> 00:07:36.215
to,

00:07:36.215 --> 00:07:38.027
which is this new queue binding.

00:07:38.387 --> 00:07:40.347
So you can see we have a new queue binding right

00:07:40.347 --> 00:07:40.627
here.

00:07:41.266 --> 00:07:43.866
I'm going to head over to our Cloudflare dashboard

00:07:43.866 --> 00:07:45.906
and I still have the log tabs up here,

00:07:46.066 --> 00:07:47.306
so let's just go ahead and like,

00:07:47.306 --> 00:07:49.186
see if we can't try this live log again.

00:07:49.906 --> 00:07:52.466
And I have our ui,

00:07:52.466 --> 00:07:53.426
so we have our,

00:07:54.539 --> 00:07:56.702
and the user application has some of these links.

00:07:56.702 --> 00:07:57.822
So let's go ahead and

00:07:58.342 --> 00:08:00.042
I'm just going to click on a link and I'm just

00:08:00.042 --> 00:08:01.682
going to copy this top section,

00:08:01.682 --> 00:08:03.882
just because we don't have our actual URL built

00:08:03.882 --> 00:08:04.322
out yet.

00:08:04.642 --> 00:08:07.202
And then I'm going to go to our data service.

00:08:07.202 --> 00:08:09.072
This is our data service URL we're going to,

00:08:09.142 --> 00:08:12.062
which you can also access here from the deployment

00:08:12.062 --> 00:08:12.582
right here.

00:08:13.462 --> 00:08:14.322
And I'm going to,

00:08:14.322 --> 00:08:17.162
append to the end of it this specific id,

00:08:17.242 --> 00:08:18.762
because I know this is a valid id,

00:08:19.002 --> 00:08:20.922
and this should redirect to Google.

00:08:20.955 --> 00:08:22.449
And then as you can see,

00:08:22.529 --> 00:08:25.169
our real time logs were able to capture the actual

00:08:25.249 --> 00:08:25.609
link.

00:08:25.609 --> 00:08:26.049
Click.

00:08:26.129 --> 00:08:28.529
So this is the get request to a valid URL.

00:08:29.089 --> 00:08:31.769
And then I did this three times just to make sure

00:08:31.769 --> 00:08:33.249
we're able to get some data into here.

00:08:33.409 --> 00:08:33.969
And then

00:08:34.289 --> 00:08:35.969
our queue event was triggered.

00:08:35.969 --> 00:08:38.129
So you can see we have our QEvent log

00:08:38.339 --> 00:08:39.059
which is right here.

00:08:39.619 --> 00:08:42.339
And then we're actually logging out the JSON data.

00:08:42.419 --> 00:08:43.579
I'm going to go ahead and stop that.

00:08:43.579 --> 00:08:46.259
We should have a valid our valid data in our logs.

00:08:46.499 --> 00:08:49.179
And then you can see here we actually are able to

00:08:49.179 --> 00:08:50.499
capture that data that we sent.

00:08:50.499 --> 00:08:51.659
So it's of the type leak.

00:08:51.659 --> 00:08:52.099
Click.

00:08:52.309 --> 00:08:53.189
this is the destination,

00:08:53.668 --> 00:08:54.869
this is the country code,

00:08:54.869 --> 00:08:55.909
this is the link id,

00:08:56.069 --> 00:08:57.029
the timestamp,

00:08:57.189 --> 00:08:57.949
the latitude,

00:08:57.949 --> 00:08:59.149
the longitude of the user.

00:08:59.149 --> 00:09:01.349
So we're actually successfully able to capture

00:09:01.349 --> 00:09:01.669
data

00:09:02.229 --> 00:09:04.309
at this specific layer,

00:09:04.439 --> 00:09:05.319
in our application.

00:09:05.319 --> 00:09:07.319
So from here what we're going to want to do is

00:09:07.319 --> 00:09:09.399
we're going to want to actually build out the

00:09:09.799 --> 00:09:10.879
handler for this.

00:09:10.879 --> 00:09:11.239
And

00:09:11.489 --> 00:09:13.689
I like to build out the handler in a very type

00:09:13.689 --> 00:09:14.209
safe way.

00:09:14.289 --> 00:09:15.809
So I'm going to walk us through that process.

