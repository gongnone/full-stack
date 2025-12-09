WEBVTT
X-TIMESTAMP-MAP=LOCAL:00:00:00.000,MPEGTS:900000

00:00:00.018 --> 00:00:00.298
Alright,

00:00:00.298 --> 00:00:02.178
so this next section of the course is where we're

00:00:02.178 --> 00:00:03.858
going to be getting into durable objects.

00:00:03.858 --> 00:00:06.738
And durable objects to a lot of developers and a

00:00:06.738 --> 00:00:08.538
lot of people that are new to the Cloudflare

00:00:08.538 --> 00:00:11.098
ecosystem are a bit confusing and kind of hard to

00:00:11.098 --> 00:00:11.778
reason about.

00:00:12.328 --> 00:00:14.488
and I do think it's kind of justified that

00:00:14.488 --> 00:00:14.968
confusion.

00:00:14.968 --> 00:00:16.048
When I first looked at it,

00:00:16.048 --> 00:00:17.768
it didn't make total sense to me.

00:00:17.768 --> 00:00:19.928
I had to dive pretty deep to get a good

00:00:19.928 --> 00:00:21.968
understanding about what durable objects are,

00:00:22.418 --> 00:00:22.978
how to use them,

00:00:22.978 --> 00:00:23.778
when to use them.

00:00:23.858 --> 00:00:26.938
And now I honestly think that they are a part of

00:00:26.938 --> 00:00:28.018
my stack that

00:00:28.338 --> 00:00:30.018
allow me to solve really,

00:00:30.018 --> 00:00:32.738
really challenging problems in a pretty simple

00:00:32.738 --> 00:00:33.018
way.

00:00:33.018 --> 00:00:34.738
And we'll kind of get into why.

00:00:34.998 --> 00:00:37.078
but in order to kind of understand why and

00:00:37.558 --> 00:00:39.158
why we're going to be using them in the course and

00:00:39.158 --> 00:00:39.798
how they work,

00:00:40.038 --> 00:00:43.158
let's go over a high level data flow of our

00:00:43.158 --> 00:00:43.958
service right now.

00:00:43.958 --> 00:00:44.358
So,

00:00:44.698 --> 00:00:46.938
if you're somebody that's kind of coming from the

00:00:47.258 --> 00:00:47.818
AI,

00:00:47.818 --> 00:00:48.818
like coding world,

00:00:48.818 --> 00:00:50.218
you kind of got into coding

00:00:50.688 --> 00:00:51.208
through AI,

00:00:51.208 --> 00:00:52.848
that's when you really started picking things up.

00:00:52.848 --> 00:00:54.608
You're probably used to just kind of like,

00:00:55.298 --> 00:00:57.778
just building on top of a web framework and never

00:00:57.778 --> 00:01:00.098
really thinking about too much about the server

00:01:00.098 --> 00:01:02.008
and dataflow and state management and stuff.

00:01:02.008 --> 00:01:03.398
or even if you're just a web,

00:01:03.398 --> 00:01:05.677
like a full stack developer that primarily focuses

00:01:05.677 --> 00:01:06.198
on the front end,

00:01:06.198 --> 00:01:08.118
the back inside might be a little bit,

00:01:08.188 --> 00:01:09.198
cumbersome to

00:01:09.420 --> 00:01:10.060
dive into,

00:01:10.140 --> 00:01:10.980
or maybe,

00:01:10.980 --> 00:01:11.420
you know,

00:01:11.420 --> 00:01:12.420
daunting to dive into.

00:01:12.420 --> 00:01:14.340
But if you just look at the data flow that we

00:01:14.340 --> 00:01:15.100
built out so far,

00:01:15.390 --> 00:01:16.510
nothing's been too complicated.

00:01:16.510 --> 00:01:18.630
It's all kind of like pretty easy to reason about.

00:01:18.630 --> 00:01:20.240
But we have a lot going on here.

00:01:20.240 --> 00:01:21.070
we have a UI

00:01:21.470 --> 00:01:21.870
that,

00:01:21.870 --> 00:01:22.270
you know,

00:01:22.270 --> 00:01:24.230
shipped to the client and then the requests are

00:01:24.230 --> 00:01:25.910
sent up to a backend that's running on a worker.

00:01:25.910 --> 00:01:28.070
And we're using TRPC to make sure things are type

00:01:28.070 --> 00:01:28.510
safe.

00:01:28.510 --> 00:01:30.470
And then TRPC right now is just literally

00:01:30.470 --> 00:01:32.420
interfacing with our database directly right here.

00:01:32.520 --> 00:01:34.160
and it's sticking some data into the database,

00:01:34.160 --> 00:01:35.960
sometimes it's pulling data from the database to

00:01:35.960 --> 00:01:37.080
render that into the UI.

00:01:37.623 --> 00:01:40.663
And then once we create our links with destination

00:01:40.743 --> 00:01:41.463
URLs,

00:01:41.733 --> 00:01:44.263
we have a HONO API that is just really simply,

00:01:44.563 --> 00:01:44.883
you know,

00:01:44.883 --> 00:01:46.403
taking that link id,

00:01:46.563 --> 00:01:48.083
looking up the corresponding

00:01:48.563 --> 00:01:51.523
URLs based upon the region that the user is in,

00:01:51.683 --> 00:01:53.723
and then it is redirecting them to that

00:01:53.723 --> 00:01:54.163
destination.

00:01:54.243 --> 00:01:54.803
And then,

00:01:55.053 --> 00:01:56.743
in the background it's taking that information

00:01:56.823 --> 00:01:58.743
that it collects for the click link and it's

00:01:58.743 --> 00:01:59.863
sending it over to a queue.

00:02:00.182 --> 00:02:01.063
And then the queue,

00:02:01.503 --> 00:02:04.023
is being consumed by a consumer that lives in the

00:02:04.023 --> 00:02:06.663
same project that actually hosts this Hono API.

00:02:06.663 --> 00:02:07.863
They're kind of separate entities,

00:02:07.863 --> 00:02:08.863
but they're in the same project.

00:02:09.023 --> 00:02:10.983
This consumer could be moved to another service

00:02:10.983 --> 00:02:11.423
separately,

00:02:11.423 --> 00:02:12.503
but there's no need.

00:02:12.503 --> 00:02:14.163
There's really no reason to have more than two,

00:02:14.313 --> 00:02:14.793
two services,

00:02:14.953 --> 00:02:16.873
these two services in our application.

00:02:16.873 --> 00:02:18.233
So I hope this makes sense so far.

00:02:18.633 --> 00:02:19.033
Now

00:02:19.573 --> 00:02:20.893
is really high level data flow.

00:02:20.893 --> 00:02:22.973
And I kind of skipped over things like right here

00:02:22.973 --> 00:02:23.533
we're using,

00:02:23.753 --> 00:02:24.243
cloudwork,

00:02:24.243 --> 00:02:24.963
KV and stuff,

00:02:24.963 --> 00:02:26.243
but this is just high level stuff.

00:02:26.563 --> 00:02:26.963
Now,

00:02:27.693 --> 00:02:30.453
on this side we have our workflow and our workflow

00:02:30.453 --> 00:02:33.093
is doing some browser rendering and it's using AI

00:02:33.093 --> 00:02:34.333
to detect stuff,

00:02:34.493 --> 00:02:36.813
saving some data into our database and then it is

00:02:36.813 --> 00:02:38.413
saving some information into R2.

00:02:38.653 --> 00:02:40.813
And so far what we have been doing is we've been

00:02:40.813 --> 00:02:42.973
manually triggering this workflow via the ui,

00:02:42.973 --> 00:02:44.253
the cloudflare dashboard.

00:02:44.723 --> 00:02:44.963
Now

00:02:45.063 --> 00:02:47.431
what we want to do is we want to find a way

00:02:47.751 --> 00:02:50.871
to trigger this workflow programmatically and it

00:02:50.871 --> 00:02:54.071
has to kind of fit inside of the data flow within

00:02:54.151 --> 00:02:55.881
our ecosystem that we've built out.

00:02:56.031 --> 00:02:56.360
now

00:02:56.360 --> 00:02:58.366
there's a lot of ways to do this and there's no

00:02:58.366 --> 00:02:59.966
right or wrong way to do this,

00:02:59.966 --> 00:03:00.366
but

00:03:00.846 --> 00:03:01.566
a lot of

00:03:01.966 --> 00:03:03.806
the structure of how we're going to build this out

00:03:03.806 --> 00:03:06.606
is going to depend upon the business logic that we

00:03:06.606 --> 00:03:07.326
want to implement.

00:03:07.647 --> 00:03:10.007
Now this layer of the workflow is the most

00:03:10.007 --> 00:03:10.767
expensive

00:03:12.267 --> 00:03:14.467
of our stack right now because we have AI,

00:03:14.467 --> 00:03:15.307
we have browser rendering,

00:03:15.307 --> 00:03:17.187
we're saving like heavy files into R2.

00:03:17.187 --> 00:03:18.227
So this is like,

00:03:18.227 --> 00:03:19.386
it's not crazy expensive,

00:03:19.386 --> 00:03:19.907
but it's,

00:03:19.907 --> 00:03:20.267
it's,

00:03:20.267 --> 00:03:22.067
we're definitely not going to want to run the

00:03:22.067 --> 00:03:24.667
workflow every single time we get a link click.

00:03:24.667 --> 00:03:25.547
That'd be crazy,

00:03:25.547 --> 00:03:25.907
right?

00:03:26.227 --> 00:03:28.307
What we're going to want to do is we're going to

00:03:28.307 --> 00:03:30.677
want to find a way in this section to,

00:03:30.747 --> 00:03:31.547
to basically say,

00:03:31.547 --> 00:03:31.947
hey,

00:03:32.427 --> 00:03:33.627
I want to,

00:03:34.107 --> 00:03:34.667
you know,

00:03:34.747 --> 00:03:35.987
listen to the link clicks.

00:03:35.987 --> 00:03:37.467
Because the consumer right now is listening to

00:03:37.467 --> 00:03:38.187
link clicks

00:03:38.587 --> 00:03:41.267
and then given a certain period of time or some

00:03:41.267 --> 00:03:41.907
type of like,

00:03:41.907 --> 00:03:42.427
logic.

00:03:42.427 --> 00:03:45.627
So let's say for now we say we're going to get a

00:03:45.627 --> 00:03:46.267
link click

00:03:46.586 --> 00:03:48.827
and in three days from now

00:03:49.147 --> 00:03:50.187
we're going to run

00:03:50.507 --> 00:03:50.907
a

00:03:51.467 --> 00:03:52.747
workflow for

00:03:52.933 --> 00:03:55.229
that specific link click and all of the other link

00:03:55.229 --> 00:03:57.229
clicks that I received for the same destination

00:03:57.229 --> 00:03:57.829
URL

00:03:58.329 --> 00:03:58.729
one time.

00:03:58.889 --> 00:03:59.609
So basically,

00:03:59.689 --> 00:04:03.449
one link could be clicked 500 times and it could

00:04:03.449 --> 00:04:04.009
go to

00:04:04.329 --> 00:04:06.489
the same destination in this example.

00:04:06.969 --> 00:04:08.849
And instead of running this workflow for that

00:04:08.849 --> 00:04:11.289
exact Same destination URL 500 times,

00:04:11.289 --> 00:04:12.649
we're just going to basically say,

00:04:12.649 --> 00:04:13.049
hey,

00:04:13.289 --> 00:04:15.609
set a timer for this specific destination

00:04:15.929 --> 00:04:18.409
three days into the future and then trigger this

00:04:18.409 --> 00:04:19.049
workflow.

00:04:19.249 --> 00:04:19.609
so that,

00:04:19.609 --> 00:04:21.369
that's just kind of like a really simple way.

00:04:21.769 --> 00:04:24.249
at this layer we could have some enhanced

00:04:24.409 --> 00:04:26.969
functionality where we will run,

00:04:28.329 --> 00:04:30.289
where we will run like health checks for

00:04:30.289 --> 00:04:32.409
destination URLs that get link clicks,

00:04:32.809 --> 00:04:33.311
you know,

00:04:33.311 --> 00:04:33.938
10 days,

00:04:34.098 --> 00:04:34.818
every 10 days.

00:04:35.058 --> 00:04:36.818
And if the user is paid,

00:04:36.818 --> 00:04:39.018
then maybe we do it every day if a link is

00:04:39.018 --> 00:04:39.458
clicked.

00:04:39.618 --> 00:04:42.418
Or maybe we have really advanced state management

00:04:42.418 --> 00:04:45.738
logic where if it's the first time that we get a

00:04:45.738 --> 00:04:47.938
link click for a specific destination URL,

00:04:48.098 --> 00:04:49.658
we'll go ahead and run that workflow,

00:04:49.658 --> 00:04:50.498
make sure it's healthy.

00:04:50.898 --> 00:04:51.458
And then

00:04:51.648 --> 00:04:52.528
once we run it once,

00:04:52.768 --> 00:04:54.128
we'll set another timer

00:04:54.448 --> 00:04:54.648
a

00:04:54.648 --> 00:04:55.428
day into the future

00:04:55.828 --> 00:04:57.468
or the next time we get the link click for the

00:04:57.468 --> 00:04:58.068
same destination,

00:04:58.388 --> 00:04:59.988
we'll set it for one day into the future

00:05:00.308 --> 00:05:01.268
just so we can like,

00:05:01.268 --> 00:05:03.468
basically not run this workflow unnecessarily too

00:05:03.468 --> 00:05:04.068
many times.

00:05:04.388 --> 00:05:06.948
But we can also kind of like build out a lot of

00:05:07.187 --> 00:05:10.268
really sophisticated logic to determine when this

00:05:10.268 --> 00:05:11.268
workflow should be run.

00:05:11.748 --> 00:05:13.788
Now that's ultimately what we're going to be able

00:05:13.788 --> 00:05:15.828
to accomplish with durable objects.

00:05:15.828 --> 00:05:16.027
Now

00:05:16.130 --> 00:05:17.650
our use case is going to be pretty simple.

00:05:17.810 --> 00:05:19.250
We're just going to be using like,

00:05:19.250 --> 00:05:19.930
state to keep,

00:05:19.930 --> 00:05:22.210
we're going to keep Track of like some specific

00:05:22.210 --> 00:05:24.130
information that we gleaned from a link click.

00:05:24.450 --> 00:05:26.690
And then in the future we're just going to set

00:05:26.690 --> 00:05:27.530
some timer to say,

00:05:27.530 --> 00:05:27.770
hey,

00:05:27.770 --> 00:05:29.090
in the future let's run this workflow,

00:05:29.090 --> 00:05:29.913
make sure everything's good.

00:05:29.913 --> 00:05:32.694
and the reason why durable objects make sense for

00:05:32.694 --> 00:05:35.094
this specific implementation to solve this problem

00:05:35.494 --> 00:05:38.414
is because durable objects have really two things

00:05:38.414 --> 00:05:39.174
that we care about.

00:05:39.644 --> 00:05:40.844
They can keep track of state

00:05:42.444 --> 00:05:42.844
and

00:05:43.000 --> 00:05:43.804
they have an alarm,

00:05:43.804 --> 00:05:44.116
which,

00:05:44.293 --> 00:05:46.341
which is ultimately just some type of scheduling

00:05:46.341 --> 00:05:46.941
mechanism.

00:05:47.021 --> 00:05:48.621
So we can do those two things.

00:05:48.621 --> 00:05:50.741
We can keep track of state and then we can say in

00:05:50.741 --> 00:05:51.661
a certain period of time,

00:05:52.061 --> 00:05:52.781
wake up

00:05:53.181 --> 00:05:54.541
and run some logic.

00:05:54.541 --> 00:05:56.735
And we have context to that state.

00:05:56.735 --> 00:05:57.969
And what makes it really cool

00:05:58.289 --> 00:05:58.689
is

00:05:59.269 --> 00:06:00.709
we have the state and we have an alarm,

00:06:00.709 --> 00:06:03.749
but we essentially create an instance of a durable

00:06:03.749 --> 00:06:07.629
object for every single destination link that gets

00:06:07.629 --> 00:06:07.784
clicked.

00:06:07.784 --> 00:06:08.617
And it's very cheap.

00:06:08.617 --> 00:06:08.877
So like,

00:06:08.877 --> 00:06:10.837
you're not necessarily billed on how many

00:06:11.077 --> 00:06:13.677
instances of a durable object are out there.

00:06:13.677 --> 00:06:15.957
So if you imagine this application scales,

00:06:16.197 --> 00:06:19.517
we have 10 million link clicks all to different

00:06:19.517 --> 00:06:20.357
destinations.

00:06:20.437 --> 00:06:22.797
There could be 10,000 instances of a durable

00:06:22.797 --> 00:06:23.237
object,

00:06:23.397 --> 00:06:24.997
all with their independent state

00:06:25.587 --> 00:06:26.947
and their independent alarm,

00:06:27.507 --> 00:06:30.587
managing the lifecycle of running these workflows.

00:06:30.587 --> 00:06:32.427
And I know this is probably still a little bit

00:06:32.427 --> 00:06:33.107
confusing if

00:06:33.637 --> 00:06:34.847
you've never used durable objects.

00:06:34.847 --> 00:06:36.527
And that's okay because as we get into the code,

00:06:36.527 --> 00:06:38.047
things are going to make a lot more sense.

00:06:38.127 --> 00:06:40.527
But just kind of think from this really high level

00:06:40.606 --> 00:06:41.407
first you know,

00:06:41.567 --> 00:06:42.687
you're keeping track of state.

00:06:42.767 --> 00:06:45.047
So there's kind of like a storage database device

00:06:45.047 --> 00:06:46.287
inside of a durable object.

00:06:46.447 --> 00:06:49.327
You're able to create instances of a durable

00:06:49.327 --> 00:06:51.087
object based upon your business logic.

00:06:51.287 --> 00:06:52.047
In our situation,

00:06:52.047 --> 00:06:53.207
it's going to be a destination.

00:06:54.017 --> 00:06:57.667
URL is what like makes a durable object unique.

00:06:57.987 --> 00:07:00.467
And we have the ability to schedule something into

00:07:00.467 --> 00:07:02.787
the future so we can run some code at some given

00:07:02.787 --> 00:07:04.147
point in time into the future.

00:07:04.227 --> 00:07:05.267
Now before

00:07:05.747 --> 00:07:07.267
we go into the code,

00:07:07.587 --> 00:07:10.067
I do have two videos out that I'm actually pretty

00:07:10.067 --> 00:07:10.427
proud of.

00:07:10.427 --> 00:07:11.507
This video about,

00:07:11.637 --> 00:07:13.410
durable objects starts

00:07:13.810 --> 00:07:15.890
really general but goes very deep,

00:07:16.120 --> 00:07:18.720
specifically for use cases that are kind of like

00:07:18.720 --> 00:07:20.840
managing state and running code inside of a

00:07:20.840 --> 00:07:21.492
durable object.

00:07:21.516 --> 00:07:22.396
So I would suggest,

00:07:22.616 --> 00:07:24.616
watching this one first and then later throughout

00:07:24.616 --> 00:07:24.936
the course.

00:07:24.936 --> 00:07:26.696
We're actually going to be using durable objects

00:07:26.696 --> 00:07:27.776
to manage state between

00:07:28.096 --> 00:07:28.896
websockets,

00:07:28.896 --> 00:07:30.136
between client and server,

00:07:30.136 --> 00:07:30.456
and

00:07:31.016 --> 00:07:32.856
technically multiple types of users.

00:07:32.856 --> 00:07:33.176
So

00:07:33.456 --> 00:07:34.776
this video actually does that.

00:07:34.776 --> 00:07:36.376
We build out the

00:07:37.176 --> 00:07:38.956
real time ability to like

00:07:39.356 --> 00:07:40.916
in real time see what somebody else is doing

00:07:40.916 --> 00:07:43.596
inside of excelidraw we kind of go through that in

00:07:43.596 --> 00:07:43.956
that video.

00:07:43.956 --> 00:07:44.876
This one is longer.

00:07:45.276 --> 00:07:46.476
It's not necessary to watch.

00:07:46.476 --> 00:07:47.596
But these two videos,

00:07:47.596 --> 00:07:47.796
I think,

00:07:47.796 --> 00:07:48.076
are really,

00:07:48.076 --> 00:07:49.796
really good explanations of how to use durable

00:07:49.796 --> 00:07:51.356
objects and why you would want to use them.

00:07:51.596 --> 00:07:53.676
So I'm going to link to these in the description

00:07:53.676 --> 00:07:54.196
of this video.

00:07:54.196 --> 00:07:55.676
But in this next video,

00:07:55.676 --> 00:07:57.356
we're actually going to start diving deep into the

00:07:57.356 --> 00:07:57.517
code.

