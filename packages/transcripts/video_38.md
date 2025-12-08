WEBVTT
X-TIMESTAMP-MAP=LOCAL:00:00:00.000,MPEGTS:900000

00:00:00.090 --> 00:00:00.490
alright,

00:00:00.490 --> 00:00:02.210
so now let's start building out our durable

00:00:02.210 --> 00:00:02.730
object.

00:00:02.810 --> 00:00:04.290
What we're going to do is we're going to make

00:00:04.290 --> 00:00:04.530
sure,

00:00:04.530 --> 00:00:07.050
sure we head over to the data service project,

00:00:07.610 --> 00:00:10.130
head over to Source and then now we're going to

00:00:10.130 --> 00:00:11.610
create a new folder called

00:00:12.090 --> 00:00:12.730
Durable

00:00:15.530 --> 00:00:16.330
Objects.

00:00:16.490 --> 00:00:17.039
All right.

00:00:17.329 --> 00:00:19.329
this specific durable object,

00:00:19.649 --> 00:00:21.289
what we can do is we can basically,

00:00:21.289 --> 00:00:22.929
I think we're going to name it something along the

00:00:22.929 --> 00:00:24.769
lines of Evaluation Scheduler

00:00:25.399 --> 00:00:28.039
because the core goal of this durable object is to

00:00:28.039 --> 00:00:30.519
schedule out when the evaluation workflow should

00:00:30.519 --> 00:00:30.839
run.

00:00:30.919 --> 00:00:34.439
So I'm going to say Evaluation Scheduler TS

00:00:34.632 --> 00:00:35.243
and to

00:00:35.723 --> 00:00:36.923
as like kind of just,

00:00:36.923 --> 00:00:37.643
just getting started.

00:00:37.643 --> 00:00:39.443
What I want to do is I want to just build out a

00:00:39.443 --> 00:00:42.643
base class with just a really simple like counter

00:00:42.643 --> 00:00:43.163
logic.

00:00:43.163 --> 00:00:45.083
Just so if you've never worked with durable

00:00:45.083 --> 00:00:45.723
objects before

00:00:46.123 --> 00:00:46.923
you can understand

00:00:47.243 --> 00:00:47.353
at

00:00:47.353 --> 00:00:47.663
like

00:00:48.063 --> 00:00:50.543
the core level how state is managed

00:00:50.793 --> 00:00:52.673
inside of a durable object and then how they can

00:00:52.673 --> 00:00:53.313
be useful.

00:00:53.313 --> 00:00:55.273
So what we're going to do is we're importing

00:00:55.273 --> 00:00:56.073
Durable Object from

00:00:56.073 --> 00:00:57.173
the Cloudflare Workers

00:00:57.493 --> 00:00:58.053
package.

00:00:58.693 --> 00:01:00.853
We're going to extend Durable object here

00:01:02.053 --> 00:01:02.693
and then

00:01:03.093 --> 00:01:05.173
what I'm going to do is basically

00:01:05.568 --> 00:01:06.793
create a function Object() { [native code] }.

00:01:07.433 --> 00:01:10.713
This  is going to be called when the durable

00:01:10.713 --> 00:01:12.873
object is instantiated and I'll show you what that

00:01:12.873 --> 00:01:14.153
means in just a minute.

00:01:14.153 --> 00:01:14.633
If you

00:01:14.963 --> 00:01:16.763
are not super familiar with object oriented

00:01:16.763 --> 00:01:17.158
programming

00:01:17.260 --> 00:01:19.500
and inside of our

00:01:20.300 --> 00:01:21.180
as part of

00:01:21.290 --> 00:01:21.640
Java,

00:01:21.640 --> 00:01:22.443
the JavaScript

00:01:22.443 --> 00:01:23.271
way of doing things,

00:01:23.271 --> 00:01:24.231
you have to call super

00:01:25.031 --> 00:01:27.191
pass in the context and the environment.

00:01:28.471 --> 00:01:30.311
You shouldn't have any more type errors at this

00:01:30.311 --> 00:01:30.631
point.

00:01:30.951 --> 00:01:33.031
And then what we're going to do is at the top

00:01:33.031 --> 00:01:35.831
level let's just define a variable called count.

00:01:36.791 --> 00:01:39.431
And count is going to be a number

00:01:40.011 --> 00:01:41.771
and it's just going to default to

00:01:42.651 --> 00:01:43.051
zero.

00:01:43.236 --> 00:01:43.636
And

00:01:44.356 --> 00:01:46.556
on top of that what we're going to do is inside of

00:01:46.556 --> 00:01:49.756
this  when the storable object starts for the very

00:01:49.756 --> 00:01:50.356
first time,

00:01:50.516 --> 00:01:52.836
we are going to go fetch

00:01:53.156 --> 00:01:53.556
count

00:01:54.276 --> 00:01:55.316
from storage.

00:01:55.396 --> 00:01:57.156
So you can imagine a scenario where

00:01:57.476 --> 00:02:00.156
count is incremented and then the durable object

00:02:00.156 --> 00:02:02.556
goes down because of due to inactivity and then

00:02:02.556 --> 00:02:03.156
it's hit again.

00:02:03.156 --> 00:02:04.916
We're going to want to recover the last known

00:02:04.996 --> 00:02:05.396
count.

00:02:05.798 --> 00:02:06.918
So the context,

00:02:06.918 --> 00:02:08.198
the durable object state

00:02:08.838 --> 00:02:09.718
has a

00:02:10.190 --> 00:02:12.870
method called block concurrency while which

00:02:12.870 --> 00:02:15.590
basically means no other action is going to be

00:02:15.590 --> 00:02:17.470
happening inside of this durable object

00:02:17.870 --> 00:02:18.990
while this is running.

00:02:18.990 --> 00:02:20.590
This just makes it so you don't have

00:02:20.990 --> 00:02:23.150
other requests going to your durable object trying

00:02:23.150 --> 00:02:23.950
to access data

00:02:24.270 --> 00:02:26.150
while this is running because you don't want a

00:02:26.150 --> 00:02:28.270
scenario where you get some type of race conflict.

00:02:29.270 --> 00:02:30.230
now what

00:02:30.700 --> 00:02:32.940
going to do is I'm going to say this dot count

00:02:33.180 --> 00:02:35.340
because we've defined this at the top level of a

00:02:35.340 --> 00:02:35.580
class,

00:02:35.580 --> 00:02:36.780
it's now part of

00:02:37.180 --> 00:02:37.900
this class

00:02:38.540 --> 00:02:40.220
and we're going to say await

00:02:40.290 --> 00:02:43.696
ctx.storage.get

00:02:44.656 --> 00:02:46.016
and we're just going to get

00:02:46.576 --> 00:02:46.976
count.

00:02:47.456 --> 00:02:49.296
Now the very first time this runs

00:02:49.776 --> 00:02:52.256
it's never going to actually be there.

00:02:52.496 --> 00:02:54.096
So if it's not there,

00:02:54.256 --> 00:02:56.456
what we want to do is we just want to return this

00:02:56.456 --> 00:02:57.216
dot count

00:02:57.976 --> 00:02:59.656
because we are defaulting it to zero.

00:02:59.736 --> 00:03:02.296
We could also just say zero but since we're

00:03:02.296 --> 00:03:04.256
defaulting it to zero this is probably a better

00:03:04.256 --> 00:03:04.571
pattern.

00:03:04.764 --> 00:03:07.004
So now let's go define a method called increment

00:03:07.084 --> 00:03:09.764
that's going to increment the count by one every

00:03:09.764 --> 00:03:11.084
single time that it is called.

00:03:11.964 --> 00:03:14.404
So we're going to say increment and what we can do

00:03:14.404 --> 00:03:15.964
is we can say this dot count

00:03:17.244 --> 00:03:18.124
plus plus

00:03:18.844 --> 00:03:20.444
and then we're going to await

00:03:20.794 --> 00:03:23.914
this dot ctx dot storage

00:03:26.775 --> 00:03:30.375
dot put and then we're going to put into our count

00:03:32.495 --> 00:03:33.695
key value store

00:03:34.015 --> 00:03:36.255
this dot count so the incremented value.

00:03:37.496 --> 00:03:39.896
Alright so we've been able to quickly build out

00:03:40.136 --> 00:03:42.536
just a very simple dummy class.

00:03:42.536 --> 00:03:44.846
Now we're going to actually remove this and this,

00:03:44.996 --> 00:03:45.876
this and this later

00:03:46.196 --> 00:03:48.876
I just want to illustrate how state is managed.

00:03:48.876 --> 00:03:49.876
So just to recap,

00:03:49.956 --> 00:03:53.156
we have a in memory value variable called count.

00:03:53.396 --> 00:03:56.156
It is going to be backed up by storage whenever

00:03:56.156 --> 00:03:56.876
it's incremented.

00:03:56.876 --> 00:03:58.356
We're also going to be flushing it

00:03:58.676 --> 00:03:59.076
to

00:04:00.126 --> 00:04:02.766
to our storage in this value called count.

00:04:02.926 --> 00:04:05.166
Now we can also say async

00:04:05.376 --> 00:04:05.736
get

00:04:06.056 --> 00:04:06.456
count

00:04:07.656 --> 00:04:09.456
and what this is going to do is this is just going

00:04:09.456 --> 00:04:10.136
to say return

00:04:11.556 --> 00:04:12.916
this dot count.

00:04:14.110 --> 00:04:15.910
Now notice we're not actually having to go to

00:04:15.910 --> 00:04:18.030
storage for this operation and the reason we don't

00:04:18.030 --> 00:04:19.510
have to go to storage for this operation is

00:04:19.510 --> 00:04:21.990
because this count value in memory is always the

00:04:21.990 --> 00:04:23.258
most up to date version of it.

00:04:23.258 --> 00:04:25.522
But then if the durable object is shut off and we

00:04:25.522 --> 00:04:28.282
lose these in memory variables once it started up

00:04:28.282 --> 00:04:29.362
once again we're able to

00:04:29.912 --> 00:04:31.978
we're able to pull that count from storage again.

00:04:32.190 --> 00:04:34.830
So now let's actually use the storable object

00:04:34.830 --> 00:04:35.870
inside of our code.

00:04:35.870 --> 00:04:37.430
The first thing that we're going to want to do is

00:04:37.430 --> 00:04:41.550
we want to head over to the wrangler JSON file and

00:04:41.550 --> 00:04:42.510
just like the other

00:04:43.220 --> 00:04:45.060
dependencies inside of our application,

00:04:45.300 --> 00:04:47.620
we can just simply add it into our

00:04:48.000 --> 00:04:48.920
wrangler JSON.

00:04:49.240 --> 00:04:51.560
So there's going to be a section called Durable

00:04:51.560 --> 00:04:52.029
Objects.

00:04:52.742 --> 00:04:54.822
Now a binding is going to take a name

00:04:55.142 --> 00:04:56.342
and a class name.

00:04:56.422 --> 00:04:59.462
So what we can say for the binding name,

00:04:59.542 --> 00:05:00.742
let's just call this,

00:05:01.002 --> 00:05:02.362
we're just going to call this evaluation

00:05:02.362 --> 00:05:03.082
scheduler,

00:05:03.082 --> 00:05:04.042
all caps.

00:05:04.042 --> 00:05:05.242
So I'm just going to say.

00:05:15.271 --> 00:05:17.231
And then also we're going to have to define the

00:05:17.231 --> 00:05:17.911
class name.

00:05:17.991 --> 00:05:20.191
So this is the actual class name that we've

00:05:20.191 --> 00:05:20.791
defined here.

00:05:22.541 --> 00:05:24.622
And then the last thing that we have to do is we

00:05:24.622 --> 00:05:26.102
have to define a migration.

00:05:26.422 --> 00:05:29.102
So essentially when a durable object is deployed

00:05:29.102 --> 00:05:29.782
for the first time,

00:05:29.782 --> 00:05:30.422
or you make

00:05:30.852 --> 00:05:33.282
substantial changes to like the actual class name,

00:05:33.282 --> 00:05:34.602
or if you want to delete a class,

00:05:35.082 --> 00:05:37.682
you have to also specify that inside of a

00:05:37.682 --> 00:05:38.842
migrations tag.

00:05:38.922 --> 00:05:39.322
So

00:05:39.582 --> 00:05:41.142
this is mainly just something that you have to do

00:05:41.142 --> 00:05:41.982
the very first time.

00:05:41.982 --> 00:05:43.322
So what we're going to do is we're going to say

00:05:43.322 --> 00:05:44.002
migrations,

00:05:44.402 --> 00:05:45.602
you have to give it a tag.

00:05:45.962 --> 00:05:49.022
this is just like a version essentially of that

00:05:49.022 --> 00:05:50.462
durable object that's being deployed.

00:05:50.462 --> 00:05:50.782
So

00:05:51.742 --> 00:05:53.862
the best convention that I've been able to follow

00:05:53.862 --> 00:05:56.222
is just you kind of say like V1 for the tag.

00:05:56.462 --> 00:05:59.502
And then what this is is this is a new class.

00:05:59.582 --> 00:06:02.782
So this specific durable object is only using the

00:06:03.022 --> 00:06:03.822
kv,

00:06:04.022 --> 00:06:04.782
storage backing.

00:06:04.782 --> 00:06:06.842
It's not using the SQL Light packet,

00:06:06.842 --> 00:06:07.322
backing.

00:06:07.322 --> 00:06:09.082
So you notice here we have

00:06:09.882 --> 00:06:10.602
two different types.

00:06:10.602 --> 00:06:11.082
We have,

00:06:11.162 --> 00:06:11.482
well,

00:06:11.482 --> 00:06:12.642
you can say delete classes,

00:06:12.642 --> 00:06:13.442
new classes,

00:06:13.442 --> 00:06:14.402
rename classes,

00:06:14.402 --> 00:06:15.682
new SQLite classes.

00:06:15.682 --> 00:06:18.322
We're just going to be using the new classes and

00:06:18.322 --> 00:06:20.602
then we just put in that class name here.

00:06:23.091 --> 00:06:23.731
Okay,

00:06:23.891 --> 00:06:25.851
so the last thing that we're going to have to do

00:06:25.851 --> 00:06:28.131
is we have to basically grab that class name.

00:06:28.371 --> 00:06:30.771
Let's head over to index ts

00:06:31.171 --> 00:06:33.371
and similar to what we've done with workflows is

00:06:33.371 --> 00:06:34.771
we're going to export

00:06:35.171 --> 00:06:36.531
that specific class name

00:06:37.011 --> 00:06:37.411
from

00:06:40.861 --> 00:06:41.981
Durable Objects

00:06:42.698 --> 00:06:44.058
Evaluation Scheduler.

00:06:45.070 --> 00:06:47.630
Then make sure we are CD'd into our

00:06:47.950 --> 00:06:48.670
data service

00:06:49.149 --> 00:06:51.430
package or our data service application.

00:06:51.430 --> 00:06:53.070
So apps data service.

00:06:54.509 --> 00:06:58.349
And then I'm going to say PMPM run CF type gen.

00:06:58.620 --> 00:06:59.020
All right,

00:06:59.100 --> 00:07:01.980
so now we have this evaluation scheduler.

00:07:02.060 --> 00:07:03.900
And what's cool about this is,

00:07:04.320 --> 00:07:07.340
because it is all imported into that index ts,

00:07:07.820 --> 00:07:08.220
the

00:07:08.600 --> 00:07:11.420
C of type gin library is able to essentially pull

00:07:11.420 --> 00:07:12.140
that class name.

00:07:12.140 --> 00:07:13.980
So we are able to get the exact

00:07:14.380 --> 00:07:16.700
methods that we defined that we can call inside of

00:07:16.700 --> 00:07:17.060
the code.

00:07:17.060 --> 00:07:18.540
And I'll show you what that means right now.

00:07:18.540 --> 00:07:18.940
So,

00:07:19.910 --> 00:07:21.630
going to want to actually call this method from

00:07:21.630 --> 00:07:22.230
our code.

00:07:22.310 --> 00:07:24.670
And right now we're just going to stand up a super

00:07:24.670 --> 00:07:25.270
dummy,

00:07:25.350 --> 00:07:26.390
get endpoint

00:07:26.710 --> 00:07:29.830
which ultimately is just going to call our durable

00:07:29.830 --> 00:07:30.310
object,

00:07:30.710 --> 00:07:31.430
increment it,

00:07:31.430 --> 00:07:32.710
then return the current value.

00:07:32.950 --> 00:07:33.350
So,

00:07:35.344 --> 00:07:37.024
so let's go ahead and do that now.

00:07:37.184 --> 00:07:39.824
So ultimately what we are going to do is we are

00:07:39.824 --> 00:07:40.544
going to create another

00:07:41.264 --> 00:07:42.064
get route.

00:07:42.294 --> 00:07:43.044
I'm just saying do,

00:07:43.044 --> 00:07:43.404
which

00:07:44.154 --> 00:07:45.434
stands for durable object.

00:07:45.754 --> 00:07:47.354
And we're going to pass in an id.

00:07:47.434 --> 00:07:47.794
Actually,

00:07:47.794 --> 00:07:48.874
let's just call this name,

00:07:48.874 --> 00:07:50.074
it'll make it a little bit

00:07:50.394 --> 00:07:51.114
more clear.

00:07:51.294 --> 00:07:52.314
we're going to call this name.

00:07:52.954 --> 00:07:53.594
And then

00:07:54.234 --> 00:07:56.714
in order to access that durable object,

00:07:56.714 --> 00:07:58.514
the first thing that you're going to want to do is

00:07:58.514 --> 00:08:01.114
you're going to want to get a durable object id so

00:08:01.114 --> 00:08:02.554
you can fetch the specific

00:08:02.874 --> 00:08:04.434
instance of a durable object.

00:08:04.434 --> 00:08:06.554
So we're going to say do ID

00:08:06.874 --> 00:08:07.434
equals

00:08:08.714 --> 00:08:10.794
and then we're going to say C EMV

00:08:13.655 --> 00:08:14.895
Evaluation Scheduler.

00:08:14.895 --> 00:08:16.695
That's our durable object binding name.

00:08:16.935 --> 00:08:19.135
And then we have a few different objects or a few

00:08:19.135 --> 00:08:20.055
different options here.

00:08:20.135 --> 00:08:22.715
GET is what you call when you have a durable

00:08:22.715 --> 00:08:23.400
object id.

00:08:23.535 --> 00:08:23.935
Now

00:08:24.335 --> 00:08:26.735
what we are going to want to do is we're going to

00:08:26.735 --> 00:08:29.935
want to either use ID from name or ID from string.

00:08:30.095 --> 00:08:32.295
Now the ID from string is like a hex

00:08:32.295 --> 00:08:34.655
representation of an actual durable object

00:08:34.655 --> 00:08:35.375
instance id.

00:08:36.245 --> 00:08:38.605
Usually there's not a ton of use cases to use

00:08:38.605 --> 00:08:38.805
this,

00:08:38.805 --> 00:08:40.005
but I have seen a few.

00:08:40.085 --> 00:08:41.885
Typically what happens is you have your own

00:08:41.885 --> 00:08:42.805
internal id

00:08:43.205 --> 00:08:44.565
and that ID could be a name,

00:08:44.565 --> 00:08:45.445
it could be a URL,

00:08:45.445 --> 00:08:45.775
it could be a,

00:08:45.775 --> 00:08:47.665
GUID that you've defined inside of your business

00:08:47.665 --> 00:08:48.185
application.

00:08:48.185 --> 00:08:49.745
And in those scenarios where it's something that

00:08:49.745 --> 00:08:51.385
you've defined on your end

00:08:51.785 --> 00:08:53.705
that is supposed to map to a single instance of a

00:08:53.705 --> 00:08:54.505
durable object,

00:08:54.665 --> 00:08:56.425
you're going to want to say ID from name.

00:08:56.505 --> 00:08:58.185
And what we're going to do is we're going to pass

00:08:58.185 --> 00:08:59.385
in the name here

00:08:59.733 --> 00:09:02.173
and then this is going to return a durable object

00:09:02.173 --> 00:09:02.493
id.

00:09:03.203 --> 00:09:03.813
it's this,

00:09:04.193 --> 00:09:05.873
it is this type right here.

00:09:05.953 --> 00:09:07.713
So from there we can say stub,

00:09:07.873 --> 00:09:10.073
this is the convention that Cloudflare has in

00:09:10.073 --> 00:09:10.633
their docs,

00:09:10.633 --> 00:09:12.113
which is basically just like

00:09:12.593 --> 00:09:14.593
the instance of a durable object.

00:09:14.593 --> 00:09:16.193
And we can say C EMV

00:09:17.473 --> 00:09:18.833
Valuation Scheduler,

00:09:18.993 --> 00:09:19.393
get,

00:09:19.633 --> 00:09:21.873
and we'll pass in that durable object id.

00:09:22.913 --> 00:09:23.313
Now

00:09:23.713 --> 00:09:26.593
from there what you're going to notice is stub

00:09:27.073 --> 00:09:28.113
now gives us access

00:09:28.433 --> 00:09:28.833
to

00:09:29.853 --> 00:09:30.053
get,

00:09:30.053 --> 00:09:31.093
count and increment.

00:09:31.093 --> 00:09:33.053
These are the methods that we've defined inside of

00:09:33.053 --> 00:09:33.913
our durable object.

00:09:33.913 --> 00:09:36.073
And these are all asynchronous because when you

00:09:36.073 --> 00:09:38.153
interface with the durable object for methods that

00:09:38.153 --> 00:09:38.593
you call,

00:09:38.593 --> 00:09:39.953
they're going to be,

00:09:40.883 --> 00:09:42.083
async so

00:09:42.483 --> 00:09:44.443
what we're going to do is we're going to first say

00:09:44.443 --> 00:09:45.043
await

00:09:46.402 --> 00:09:47.762
stub.increment

00:09:48.802 --> 00:09:51.282
and then we're going to basically say count

00:09:55.532 --> 00:09:55.932
equals

00:09:57.212 --> 00:09:57.852
await

00:09:58.572 --> 00:09:59.852
stub.get.

00:09:59.852 --> 00:10:01.452
now technically we could just return

00:10:02.172 --> 00:10:02.972
the count here,

00:10:02.972 --> 00:10:05.012
but I just want to show you how we can access both

00:10:05.012 --> 00:10:05.822
of these methods here.

00:10:05.856 --> 00:10:06.376
and then

00:10:06.598 --> 00:10:08.038
last thing that we're going to do is we're going

00:10:08.038 --> 00:10:09.158
to return this guy right here.

00:10:11.381 --> 00:10:13.901
So we're just basically passing in count into the

00:10:13.901 --> 00:10:14.421
response.

00:10:14.501 --> 00:10:15.541
So this is the

00:10:15.861 --> 00:10:17.821
way that you can interface with a durable object.

00:10:17.821 --> 00:10:19.841
Now you can do this behind an API or you can do

00:10:19.841 --> 00:10:20.801
this within a workflow,

00:10:20.801 --> 00:10:23.161
or you can do this within a queue consumer or

00:10:23.161 --> 00:10:24.361
really wherever you want.

00:10:24.361 --> 00:10:26.521
Like the convention is going to be the same.

00:10:26.521 --> 00:10:28.281
You're going to be accessing your durable object

00:10:28.281 --> 00:10:29.121
via the binding,

00:10:29.201 --> 00:10:30.801
you're going to be getting the id,

00:10:31.121 --> 00:10:33.441
you're going to be passing the ID into this get

00:10:33.441 --> 00:10:35.601
call that's going to give you the actual durable

00:10:35.601 --> 00:10:39.041
object instance that is unique based upon a given

00:10:39.201 --> 00:10:40.961
ID that you pass into here.

00:10:41.361 --> 00:10:44.001
And then you have access to the logic that you've

00:10:44.001 --> 00:10:45.081
defined inside of the class.

00:10:45.081 --> 00:10:46.001
So in our situation,

00:10:46.541 --> 00:10:48.461
increment and get count,

00:10:48.781 --> 00:10:49.661
which is right here.

00:10:49.981 --> 00:10:51.461
And we're just returning that for,

00:10:51.461 --> 00:10:52.121
this use case.

00:10:52.121 --> 00:10:55.401
Now I'm going to say PMPM run dev because you can

00:10:55.401 --> 00:10:57.121
run this locally with no issues.

00:10:58.266 --> 00:11:00.169
It looks like I have to wrangler login.

00:11:01.858 --> 00:11:04.418
Now I can do pnpm run dev.

00:11:04.518 --> 00:11:04.998
All right,

00:11:04.998 --> 00:11:07.038
so now what we're going to do is we will be

00:11:07.038 --> 00:11:08.198
heading over to

00:11:09.198 --> 00:11:09.438
a.

00:11:09.678 --> 00:11:11.518
Let's just head over to our browser

00:11:12.996 --> 00:11:15.750
and then we're going to say durable object and

00:11:15.750 --> 00:11:17.230
we're going to say test name one.

00:11:17.230 --> 00:11:17.990
Or yeah,

00:11:17.990 --> 00:11:19.110
let's say durable object

00:11:19.590 --> 00:11:21.030
and we're just going to say test

00:11:21.402 --> 00:11:21.802
one.

00:11:23.322 --> 00:11:23.722
All right,

00:11:23.722 --> 00:11:25.002
so now we have a count of.

00:11:25.242 --> 00:11:26.594
We have a count of one.

00:11:26.622 --> 00:11:27.742
We're going to keep hitting this.

00:11:28.302 --> 00:11:28.862
Okay,

00:11:29.342 --> 00:11:31.579
now let's say test two here.

00:11:31.579 --> 00:11:32.652
Notice it goes back to.

00:11:33.292 --> 00:11:33.692
Oh,

00:11:33.692 --> 00:11:36.012
I didn't do so Test two right here.

00:11:36.492 --> 00:11:37.892
Now it goes back to count one.

00:11:37.892 --> 00:11:38.332
Increment,

00:11:38.332 --> 00:11:38.732
increment,

00:11:38.732 --> 00:11:39.212
increment.

00:11:39.452 --> 00:11:41.371
Let's head back over to test one.

00:11:41.371 --> 00:11:43.132
And what we're going to notice is we're going to

00:11:43.132 --> 00:11:44.332
basically be able to

00:11:45.772 --> 00:11:49.012
retrieve the last known number incremented by one.

00:11:49.012 --> 00:11:49.692
So 16.

00:11:50.092 --> 00:11:51.212
Let's go to test two,

00:11:52.178 --> 00:11:52.818
back to seven.

00:11:52.898 --> 00:11:54.498
So now when we hit test one again,

00:11:54.498 --> 00:11:55.538
it should be 17.

00:11:56.818 --> 00:11:57.458
There we go.

00:11:57.458 --> 00:12:00.098
So essentially what's happening here is we are

00:12:00.098 --> 00:12:02.938
able to access a unique instance of a durable

00:12:02.938 --> 00:12:03.378
object.

00:12:03.378 --> 00:12:04.418
Based upon an ID

00:12:05.058 --> 00:12:06.818
or the name that we pass into here,

00:12:07.138 --> 00:12:08.898
and we're able to retrieve the state.

00:12:08.978 --> 00:12:09.778
So in this situation,

00:12:09.778 --> 00:12:12.058
there's two instances of that durable object that

00:12:12.058 --> 00:12:13.298
live inside of our

00:12:13.778 --> 00:12:13.788
application,

00:12:14.678 --> 00:12:15.558
that persist.

00:12:15.638 --> 00:12:16.038
So,

00:12:16.468 --> 00:12:17.508
test one and test two.

00:12:17.508 --> 00:12:19.748
Now obviously this could be whatever you want.

00:12:19.748 --> 00:12:21.028
You can have as many instances,

00:12:21.288 --> 00:12:23.808
as you want inside of your business application or

00:12:23.808 --> 00:12:24.888
inside of your business logic.

00:12:24.888 --> 00:12:27.088
There is no limit to the number of instances of

00:12:27.088 --> 00:12:28.568
durable objects that you can create.

00:12:28.648 --> 00:12:30.168
So I hope this makes sense.

00:12:30.458 --> 00:12:31.630
in the next part of this,

00:12:31.790 --> 00:12:32.750
in the next section,

00:12:32.750 --> 00:12:34.910
we're going to be going deeper into building out

00:12:34.910 --> 00:12:37.230
the actual evaluation scheduler,

00:12:37.230 --> 00:12:39.030
and we're going to be removing this state and

00:12:39.030 --> 00:12:39.390
whatnot.

00:12:39.390 --> 00:12:41.030
But I do think it's really important just to kind

00:12:41.030 --> 00:12:41.310
of like,

00:12:41.310 --> 00:12:42.310
at a very base level,

00:12:42.310 --> 00:12:43.710
understand that you have a

00:12:44.060 --> 00:12:44.900
durable object,

00:12:44.900 --> 00:12:46.460
or so you basically have some type of,

00:12:46.460 --> 00:12:46.700
like,

00:12:46.700 --> 00:12:49.660
durable execution that is able to run code and

00:12:49.660 --> 00:12:50.540
keep track of state,

00:12:50.780 --> 00:12:53.540
and you're able to define that at a grain of your

00:12:53.540 --> 00:12:54.380
business logic.

00:12:54.380 --> 00:12:55.620
So in this situation,

00:12:55.620 --> 00:12:56.140
whatever,

00:12:56.620 --> 00:12:59.819
whatever data that we pass into this URL becomes a

00:12:59.819 --> 00:13:00.940
new instance,

00:13:00.940 --> 00:13:02.780
and then we can retrieve instances

00:13:03.420 --> 00:13:04.300
based upon,

00:13:04.450 --> 00:13:05.704
the uniqueness of Test 1,

00:13:05.749 --> 00:13:06.180
Test 2,

00:13:06.180 --> 00:13:07.260
or whatever we put here.

00:13:07.730 --> 00:13:09.920
and then from there we're able to manage the state

00:13:10.450 --> 00:13:10.930
like this,

00:13:11.170 --> 00:13:12.850
and we're able to define our own

00:13:13.250 --> 00:13:14.610
business logic on top of that.

00:13:14.610 --> 00:13:16.530
So we're able to write our own code to interact

00:13:16.530 --> 00:13:17.250
with that state.

00:13:17.570 --> 00:13:17.810
Now,

00:13:17.810 --> 00:13:20.850
if it's still not super clear why this is useful,

00:13:20.930 --> 00:13:22.850
it's going to make more sense as we kind of

00:13:22.850 --> 00:13:24.050
progress throughout this section.

00:13:24.050 --> 00:13:26.089
But I would say just get used to this.

00:13:26.089 --> 00:13:27.570
If you've never worked with durable objects

00:13:27.570 --> 00:13:27.810
before,

00:13:28.130 --> 00:13:29.570
really think about how you're,

00:13:29.590 --> 00:13:30.630
interfacing with the class,

00:13:30.630 --> 00:13:31.790
how you're interfacing with state,

00:13:31.790 --> 00:13:33.710
and then play around with this just so it can kind

00:13:33.710 --> 00:13:34.350
of solidify.

00:13:34.350 --> 00:13:35.310
And in the next video,

00:13:35.310 --> 00:13:36.910
we're actually going to build out some of the

00:13:37.070 --> 00:13:39.470
scheduling logic to trigger our,

00:13:40.060 --> 00:13:41.420
workflows based upon

00:13:42.220 --> 00:13:44.564
logic that we define inside of our durable object.

