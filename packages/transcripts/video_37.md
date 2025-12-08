WEBVTT
X-TIMESTAMP-MAP=LOCAL:00:00:00.000,MPEGTS:900000

00:00:00.530 --> 00:00:00.650
Now,

00:00:00.650 --> 00:00:03.010
durable objects are the type of product where to

00:00:03.010 --> 00:00:03.970
really understand it,

00:00:03.970 --> 00:00:05.730
the best thing you can do is just like read

00:00:05.730 --> 00:00:07.970
through the docs in detail and try to understand

00:00:07.970 --> 00:00:10.130
absolutely everything about it and then just start

00:00:10.130 --> 00:00:11.010
building on top of it.

00:00:11.010 --> 00:00:13.450
Because it is a product that has a lot of

00:00:13.450 --> 00:00:13.970
features,

00:00:13.970 --> 00:00:16.490
and a lot of the features can kind of be hard to

00:00:16.490 --> 00:00:18.250
make sense of up until you use it.

00:00:18.250 --> 00:00:20.330
Which is why we're doing this in the course is

00:00:20.330 --> 00:00:21.290
just so you know,

00:00:21.290 --> 00:00:23.050
you'll have the muscle memory of actually being

00:00:23.050 --> 00:00:23.770
able to build something,

00:00:23.770 --> 00:00:25.570
deploy durable objects and see how it,

00:00:25.570 --> 00:00:26.210
how it works,

00:00:26.840 --> 00:00:27.880
implementing your own thing.

00:00:27.960 --> 00:00:28.360
So

00:00:28.640 --> 00:00:30.880
to get started we can just kind of like go through

00:00:30.880 --> 00:00:32.800
a few of the concepts that they have here.

00:00:32.800 --> 00:00:33.200
So

00:00:33.420 --> 00:00:35.670
to use a durable object inside of your code base,

00:00:35.670 --> 00:00:37.630
you're basically going to create a class that you

00:00:37.630 --> 00:00:39.270
define that extends a durable object.

00:00:39.270 --> 00:00:41.709
And this durable object class has access to all

00:00:41.709 --> 00:00:45.110
the durable object APIs that manage state alarms

00:00:45.190 --> 00:00:45.590
and

00:00:45.810 --> 00:00:47.170
in memory variables,

00:00:47.330 --> 00:00:48.850
WebSockets and whatnot.

00:00:48.850 --> 00:00:51.490
On top of Cloudflare's durable object platform,

00:00:51.910 --> 00:00:54.190
Now this class actually isn't doing anything right

00:00:54.190 --> 00:00:54.430
now,

00:00:54.430 --> 00:00:54.790
Has function Object() { [native code] }.

00:00:54.790 --> 00:00:55.150
function Object() { [native code] }.

00:00:55.150 --> 00:00:55.990
It takes in the state,

00:00:56.070 --> 00:00:57.110
passes it into super,

00:00:57.110 --> 00:00:58.990
but there's really nothing happening here.

00:00:58.990 --> 00:00:59.350
Now

00:00:59.930 --> 00:01:01.370
what you're going to notice is

00:01:01.407 --> 00:01:03.302
when you're working with durable objects,

00:01:03.302 --> 00:01:05.222
you kind of have like two ways of managing state.

00:01:05.302 --> 00:01:05.862
You have

00:01:06.342 --> 00:01:09.702
managing state like in memory and then you have

00:01:10.132 --> 00:01:12.412
actual like storage where you can also backup

00:01:12.412 --> 00:01:12.692
state.

00:01:12.852 --> 00:01:16.412
So a example of managing state and memory is like

00:01:16.412 --> 00:01:16.692
this.

00:01:17.312 --> 00:01:19.356
Basically you have an example where

00:01:19.388 --> 00:01:21.588
you define like at the top level of the class,

00:01:21.588 --> 00:01:23.268
a value called initialized.

00:01:23.348 --> 00:01:25.508
And then when the constructor is called for the

00:01:25.508 --> 00:01:26.028
very first time,

00:01:26.028 --> 00:01:27.868
if you're not familiar with object oriented

00:01:27.868 --> 00:01:28.388
programming,

00:01:28.468 --> 00:01:31.508
when this class is instantiated or created for the

00:01:31.508 --> 00:01:31.908
first time,

00:01:33.438 --> 00:01:35.278
this constructor is going to execute.

00:01:35.358 --> 00:01:37.198
And when this constructor executes,

00:01:37.438 --> 00:01:38.638
it's going to set,

00:01:38.798 --> 00:01:40.158
initialize to true.

00:01:40.238 --> 00:01:42.558
So you could define another method in here that

00:01:42.558 --> 00:01:44.838
like checks if it's initialized or not and it'd be

00:01:44.838 --> 00:01:45.918
referencing this variable.

00:01:46.458 --> 00:01:48.498
Now I mean this is kind of a useless example in my

00:01:48.498 --> 00:01:48.858
opinion.

00:01:48.858 --> 00:01:49.178
But

00:01:49.625 --> 00:01:51.585
when this durable object shuts down due to

00:01:51.585 --> 00:01:52.265
inactivity,

00:01:52.425 --> 00:01:54.265
because durable objects aren't on forever,

00:01:54.665 --> 00:01:55.105
they're,

00:01:55.105 --> 00:01:56.945
they do some type of like compute and then if

00:01:56.945 --> 00:01:58.545
they're not being used they'll be shut down and

00:01:58.545 --> 00:02:00.065
the next time they're accessed they'll start back

00:02:00.065 --> 00:02:02.465
up and the next time this is accessed it's going

00:02:02.465 --> 00:02:02.665
to,

00:02:02.665 --> 00:02:05.145
it's going to be false up until it's initialized.

00:02:05.365 --> 00:02:07.645
so you can imagine a scenario where you have like

00:02:07.645 --> 00:02:09.525
a counter variable here starts at zero.

00:02:10.555 --> 00:02:13.275
and then every single time it's so every single

00:02:13.275 --> 00:02:15.395
time a method is hit and increments by one and

00:02:15.395 --> 00:02:16.395
then when it shuts down

00:02:16.955 --> 00:02:18.555
it's going to start back at zero.

00:02:18.795 --> 00:02:20.315
Now if you want to persist state,

00:02:20.555 --> 00:02:21.995
this is kind of what they're doing here.

00:02:22.515 --> 00:02:24.075
you have two ways of persisting state.

00:02:24.155 --> 00:02:25.755
You have a basic key,

00:02:25.955 --> 00:02:26.965
key value back,

00:02:26.965 --> 00:02:28.125
durable object class.

00:02:28.365 --> 00:02:30.685
So it's just like a really basic here's a key,

00:02:30.685 --> 00:02:32.325
here's a value and that's how you're keeping track

00:02:32.325 --> 00:02:32.765
of state.

00:02:32.845 --> 00:02:34.805
And then they have a more sophisticated

00:02:34.805 --> 00:02:37.205
implementation that's kind of backed by SQLite.

00:02:37.205 --> 00:02:38.325
So you can actually define,

00:02:38.325 --> 00:02:39.405
you can create tables,

00:02:39.485 --> 00:02:40.765
you can store data in the tables,

00:02:40.765 --> 00:02:41.005
you

00:02:41.385 --> 00:02:43.545
queries against the data in the tables and all of

00:02:43.545 --> 00:02:45.185
that can be managed inside of a durable object.

00:02:45.185 --> 00:02:46.625
So you can think about it like if you have a

00:02:46.625 --> 00:02:48.265
durable object for each user,

00:02:48.425 --> 00:02:50.705
each user can have their own SQLite database.

00:02:50.705 --> 00:02:52.745
It's a really interesting implementation.

00:02:52.745 --> 00:02:54.625
And in the next section we're actually going to be

00:02:54.625 --> 00:02:55.225
using this

00:02:55.445 --> 00:02:58.085
along with websockets to really like get,

00:02:58.605 --> 00:03:01.685
to really like do some advanced state tracking

00:03:01.685 --> 00:03:03.005
with link clicks.

00:03:03.005 --> 00:03:05.125
But for now we're just going to start with a key

00:03:05.125 --> 00:03:05.735
value backed

00:03:05.735 --> 00:03:06.305
durable object.

00:03:06.305 --> 00:03:08.065
Just because it's like really easy to get into

00:03:08.465 --> 00:03:10.785
Now an example of how you could use this is

00:03:11.025 --> 00:03:13.305
essentially you have a method called increment and

00:03:13.305 --> 00:03:14.385
every single time this is called,

00:03:14.625 --> 00:03:16.705
it's going to go to the storage and it's going to

00:03:16.705 --> 00:03:17.185
get a value.

00:03:17.185 --> 00:03:19.145
If the value hasn't been defined ever,

00:03:19.145 --> 00:03:21.665
it'll default to 0 and then it will be incremented

00:03:21.665 --> 00:03:23.385
by 1 and then it's going to be put back into

00:03:23.385 --> 00:03:23.824
storage.

00:03:23.824 --> 00:03:25.105
So every single time this is called,

00:03:25.105 --> 00:03:26.705
it's going to be incremented by one.

00:03:26.705 --> 00:03:27.052
Now

00:03:27.070 --> 00:03:29.080
you could also technically define value at the top

00:03:29.080 --> 00:03:30.920
level of this class in memory and then the

00:03:30.920 --> 00:03:32.320
constructor could pull

00:03:32.920 --> 00:03:34.600
value and then default it to zero.

00:03:35.050 --> 00:03:37.260
and then whenever you like use the value.

00:03:37.340 --> 00:03:39.340
Instead of like pulling value from storage,

00:03:39.340 --> 00:03:42.220
you can actually reference it as the in memory

00:03:42.220 --> 00:03:42.510
state

00:03:42.840 --> 00:03:43.160
and we'll,

00:03:43.160 --> 00:03:45.040
we'll get into like how that looks and how we use

00:03:45.040 --> 00:03:45.320
that,

00:03:45.830 --> 00:03:46.300
coming up.

00:03:46.300 --> 00:03:48.460
But those are kind of like the important things to

00:03:48.460 --> 00:03:48.660
know.

00:03:48.660 --> 00:03:51.340
You have in memory state that doesn't persist

00:03:51.340 --> 00:03:51.860
through the,

00:03:51.860 --> 00:03:54.100
that doesn't persist when a durable object shuts

00:03:54.100 --> 00:03:54.380
down.

00:03:54.380 --> 00:03:55.420
And what you have,

00:03:55.420 --> 00:03:56.380
you also have

00:03:57.320 --> 00:03:58.640
storage that persist state

00:03:59.180 --> 00:03:59.620
throughout,

00:03:59.620 --> 00:03:59.980
like

00:04:00.110 --> 00:04:02.430
the killing of this durable object instance.

00:04:02.430 --> 00:04:04.030
So the next time it turns on you can actually

00:04:04.270 --> 00:04:05.470
recoup that state.

00:04:05.710 --> 00:04:06.780
So it's pretty cool.

00:04:07.530 --> 00:04:07.930
now

00:04:08.490 --> 00:04:10.250
the other thing that they talk about is alarms.

00:04:10.800 --> 00:04:13.050
they just give you some of the ergonomics of how

00:04:13.050 --> 00:04:14.050
to manage alarms.

00:04:14.050 --> 00:04:16.490
Alarms are basically just going to take like an

00:04:16.490 --> 00:04:17.850
epoch millie timestamp.

00:04:17.850 --> 00:04:19.890
So you have like date time,

00:04:19.890 --> 00:04:21.250
date now which is

00:04:21.810 --> 00:04:23.490
you know like the current time

00:04:24.110 --> 00:04:25.550
usually in UTC time,

00:04:25.740 --> 00:04:26.670
plus 10

00:04:27.150 --> 00:04:27.710
seconds.

00:04:27.710 --> 00:04:28.910
Seconds is in thousands.

00:04:28.910 --> 00:04:30.670
So like this is basically saying

00:04:31.230 --> 00:04:33.710
set an alarm 10 seconds from now and then the

00:04:33.710 --> 00:04:35.710
durable object is going to be triggered.

00:04:36.030 --> 00:04:36.430
This,

00:04:36.510 --> 00:04:38.910
whatever logic is defined inside of this alarm

00:04:38.910 --> 00:04:39.390
function

00:04:39.790 --> 00:04:42.150
is going to be triggered 10 seconds from this

00:04:42.150 --> 00:04:42.830
period of time.

00:04:42.910 --> 00:04:43.310
So

00:04:43.540 --> 00:04:45.190
we're going to be using this and we're going to

00:04:45.190 --> 00:04:48.030
like use it in a way that's a little bit easier to

00:04:48.030 --> 00:04:49.110
understand and reason about.

00:04:49.110 --> 00:04:49.870
I don't love

00:04:50.390 --> 00:04:52.630
like having hard coded 1000 seconds here.

00:04:52.630 --> 00:04:54.630
I think this is kind of like hard to

00:04:55.000 --> 00:04:57.080
just visually look at and know exactly what's

00:04:57.080 --> 00:04:57.560
going on.

00:04:57.640 --> 00:04:58.040
But

00:04:58.380 --> 00:05:00.060
these are just kind of like the things to look at.

00:05:00.060 --> 00:05:02.380
I would suggest reading through the documentation

00:05:02.540 --> 00:05:04.540
really try to grasp this because durable objects

00:05:04.540 --> 00:05:06.500
can really transform the products you're able to

00:05:06.500 --> 00:05:08.700
build without having to reach to tons of different

00:05:08.700 --> 00:05:11.580
providers to manage state in a really complicated

00:05:11.580 --> 00:05:12.420
data ecosystem.

