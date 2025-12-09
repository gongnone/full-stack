WEBVTT
X-TIMESTAMP-MAP=LOCAL:00:00:00.000,MPEGTS:900000

00:00:00.055 --> 00:00:00.495
Alright,

00:00:00.495 --> 00:00:02.815
so now that we've successfully built a producer

00:00:02.815 --> 00:00:05.375
that writes data to a queue and then a consumer

00:00:05.375 --> 00:00:07.415
right here picks that data up from the queue,

00:00:07.655 --> 00:00:10.375
let's talk about how we can properly implement a

00:00:10.375 --> 00:00:12.215
handler to be able to

00:00:12.585 --> 00:00:15.465
ensure that the data coming into the queue is of a

00:00:15.465 --> 00:00:16.105
certain type

00:00:16.185 --> 00:00:18.425
that we expect and then how we can properly

00:00:18.425 --> 00:00:21.025
process that data in a distributed system like

00:00:21.025 --> 00:00:21.305
this.

00:00:21.385 --> 00:00:21.785
So

00:00:22.075 --> 00:00:23.625
I kind of alluded to it before,

00:00:23.625 --> 00:00:24.025
but

00:00:24.515 --> 00:00:26.275
essentially what we're doing here is we're going

00:00:26.275 --> 00:00:27.795
to be using a schema,

00:00:27.795 --> 00:00:29.475
like a Zod schema to

00:00:30.255 --> 00:00:33.215
that the data in the body is of a certain type and

00:00:33.215 --> 00:00:34.935
then we're going to handle the routing based on

00:00:34.935 --> 00:00:35.255
that.

00:00:35.255 --> 00:00:38.535
So if we head over to our actual packages over

00:00:38.535 --> 00:00:38.855
here,

00:00:39.255 --> 00:00:40.515
our data Ops package,

00:00:40.515 --> 00:00:41.795
we have this

00:00:42.155 --> 00:00:43.055
we have this Zod

00:00:43.268 --> 00:00:43.788
folder

00:00:44.108 --> 00:00:46.228
and inside of the Zod folder we have some types

00:00:46.228 --> 00:00:47.228
that I've already defined.

00:00:47.308 --> 00:00:47.978
Now you see,

00:00:48.048 --> 00:00:49.608
essentially what we're doing is we're basically

00:00:49.608 --> 00:00:50.248
saying a,

00:00:50.248 --> 00:00:50.768
when we,

00:00:50.928 --> 00:00:53.688
the data coming into a queue needs to be of a

00:00:53.688 --> 00:00:54.608
specific base

00:00:54.648 --> 00:00:54.908
type,

00:00:54.908 --> 00:00:55.748
a base schema.

00:00:55.988 --> 00:00:58.268
And what that is going to do is it's going to have

00:00:58.268 --> 00:00:58.628
a

00:00:58.898 --> 00:01:00.898
it's going to have a type with a label

00:01:01.158 --> 00:01:03.738
associated with what that event type is and then

00:01:03.738 --> 00:01:05.058
it's going to pass in some data.

00:01:05.618 --> 00:01:08.718
Now this type right now that we've implemented

00:01:08.868 --> 00:01:10.948
as you kind of saw in the,

00:01:10.948 --> 00:01:12.948
when we implemented the API router is

00:01:13.348 --> 00:01:13.748
we

00:01:14.268 --> 00:01:15.468
passed the data

00:01:15.788 --> 00:01:16.828
for the specific

00:01:17.048 --> 00:01:17.688
link click.

00:01:17.688 --> 00:01:19.608
You can kind of see that over here

00:01:19.928 --> 00:01:22.852
we have this type here where it is link click

00:01:22.934 --> 00:01:23.334
and

00:01:23.654 --> 00:01:24.294
it is

00:01:24.894 --> 00:01:27.374
passing in the data of this specific type and it's

00:01:27.374 --> 00:01:30.494
adhering to this link click message type.

00:01:30.814 --> 00:01:32.574
So if we come over to this

00:01:33.254 --> 00:01:34.674
Q ZOD schema again

00:01:35.074 --> 00:01:37.474
you can see that this is extending a base class.

00:01:37.474 --> 00:01:39.554
So basically we're just building upon this kind

00:01:39.554 --> 00:01:40.674
more generic type.

00:01:41.374 --> 00:01:41.614
Now

00:01:42.054 --> 00:01:44.374
the last thing that I've done here is I am

00:01:44.534 --> 00:01:46.854
creating a discriminated union

00:01:47.414 --> 00:01:50.774
that basically looks at the type and says the data

00:01:51.414 --> 00:01:53.324
field is going to be somewhat dynamic,

00:01:53.644 --> 00:01:56.844
but it's only going to be valid data if it

00:01:56.844 --> 00:01:59.324
conforms to the schemas that we pass into

00:01:59.884 --> 00:02:02.284
this specific discriminated union.

00:02:02.364 --> 00:02:03.404
So in the future,

00:02:03.644 --> 00:02:06.204
right now we're only processing link click types.

00:02:06.204 --> 00:02:07.804
But there could be a scenario where

00:02:08.204 --> 00:02:09.404
we start processing different,

00:02:09.954 --> 00:02:12.114
different shape data on the same queue.

00:02:12.354 --> 00:02:13.954
So we could simply create another

00:02:14.274 --> 00:02:17.234
schema that looks like this with a different type

00:02:17.234 --> 00:02:18.674
that implements some data

00:02:18.904 --> 00:02:21.564
that is supposed to receive and then that will be

00:02:21.564 --> 00:02:23.724
added here to this discriminated union.

00:02:24.124 --> 00:02:25.323
So if we,

00:02:25.323 --> 00:02:28.524
if we go ahead and we head back over to our

00:02:30.114 --> 00:02:31.874
if we head back over to our

00:02:32.274 --> 00:02:34.114
index TS in our data service,

00:02:34.434 --> 00:02:36.194
we're going to go ahead and do just that.

00:02:36.194 --> 00:02:37.554
So we're going to say const

00:02:38.544 --> 00:02:39.104
parsed

00:02:39.724 --> 00:02:40.084
event

00:02:40.964 --> 00:02:41.604
equals

00:02:42.404 --> 00:02:42.804
Q

00:02:43.124 --> 00:02:44.404
message schema.

00:02:44.644 --> 00:02:47.190
So this is our generic schema type right here

00:02:47.190 --> 00:02:48.526
and then we're going to say

00:02:48.639 --> 00:02:51.442
dot safe parse so this is going to parse the data

00:02:51.681 --> 00:02:53.242
but it's not going to throw an error

00:02:53.242 --> 00:02:54.212
if it fails

00:02:55.092 --> 00:02:57.824
and we're going to pass in message.body

00:02:57.824 --> 00:02:58.552
message.body

00:02:58.872 --> 00:03:01.352
so we're going to pass in the body into safeparse.

00:03:01.752 --> 00:03:02.152
Now

00:03:04.632 --> 00:03:06.312
the next step is basically going to be

00:03:06.712 --> 00:03:08.232
ensuring that the

00:03:08.632 --> 00:03:10.392
event successfully parsed.

00:03:10.392 --> 00:03:13.672
So we can say parsed event.success.

00:03:14.792 --> 00:03:17.592
then here we're going to handle the successful

00:03:17.592 --> 00:03:20.032
event parse and if it doesn't conform to the type

00:03:20.032 --> 00:03:20.632
that we expect

00:03:21.352 --> 00:03:24.152
we're just going to go ahead and log out or error

00:03:24.392 --> 00:03:25.232
console error.

00:03:25.232 --> 00:03:25.512
The

00:03:25.912 --> 00:03:26.832
actual like

00:03:27.502 --> 00:03:28.382
parsed event

00:03:28.422 --> 00:03:29.232
error message.

00:03:29.792 --> 00:03:30.192
Now

00:03:30.782 --> 00:03:32.342
here you can do more than logging.

00:03:32.342 --> 00:03:32.982
You could probably,

00:03:32.982 --> 00:03:33.382
you know,

00:03:33.382 --> 00:03:35.022
in a production ready system you could

00:03:35.052 --> 00:03:36.822
send some data to like whatever

00:03:37.082 --> 00:03:39.242
alerting mechanism you have for monitoring your

00:03:39.242 --> 00:03:39.802
application.

00:03:39.882 --> 00:03:41.842
But for now we're just going to go ahead and log

00:03:41.842 --> 00:03:42.362
that information.

00:03:42.616 --> 00:03:45.216
The next step here is we're going to take a look.

00:03:45.216 --> 00:03:46.376
We're basically going to say,

00:03:46.626 --> 00:03:49.156
the event is going to be the parsed event dot data

00:03:49.796 --> 00:03:51.076
and then we can,

00:03:51.236 --> 00:03:54.076
from here we can check if it's of a specific type.

00:03:54.076 --> 00:03:56.236
We can pass it off to a specific handler.

00:03:56.236 --> 00:03:56.996
So we can say

00:03:57.316 --> 00:03:58.556
right now we only have one type,

00:03:58.556 --> 00:03:58.956
obviously.

00:03:58.956 --> 00:03:59.636
So if event

00:04:00.036 --> 00:04:00.916
dot type

00:04:01.396 --> 00:04:01.956
equals.

00:04:01.956 --> 00:04:04.036
And this should autocomplete the only type name

00:04:04.036 --> 00:04:05.516
that we have because this is a literal,

00:04:05.516 --> 00:04:06.396
which is kind of nice,

00:04:06.396 --> 00:04:07.476
it autocompletes for us,

00:04:08.096 --> 00:04:08.816
link click.

00:04:09.136 --> 00:04:11.616
Then we're going to pass it into a handler we're

00:04:11.616 --> 00:04:12.176
going to define.

00:04:12.176 --> 00:04:13.976
And right now that handler is just going to take

00:04:13.976 --> 00:04:16.856
that data and it's going to save it in our link

00:04:16.856 --> 00:04:17.696
clicks database,

00:04:17.696 --> 00:04:19.876
or links click table inside of our D1 database.

00:04:19.876 --> 00:04:21.916
Now if you remember earlier in the course we

00:04:21.916 --> 00:04:23.196
created a whole bunch of

00:04:23.546 --> 00:04:25.766
tables and we didn't use all those tables right

00:04:25.766 --> 00:04:26.046
away.

00:04:26.286 --> 00:04:29.166
One of the tables we didn't use is actually this

00:04:29.166 --> 00:04:30.486
link clicks table.

00:04:30.486 --> 00:04:32.686
So if we select star from

00:04:33.416 --> 00:04:34.216
link clicks,

00:04:35.416 --> 00:04:37.096
you're going to notice that there shouldn't be any

00:04:37.096 --> 00:04:37.776
data in here.

00:04:37.776 --> 00:04:38.936
It should be totally empty,

00:04:39.056 --> 00:04:41.176
because we haven't actually inserted any data into

00:04:41.176 --> 00:04:41.336
here.

00:04:41.336 --> 00:04:41.616
But,

00:04:41.696 --> 00:04:43.296
but what's going to happen is our

00:04:44.116 --> 00:04:46.796
queue pipeline is going to get that data and it's

00:04:46.796 --> 00:04:48.435
going to save it into this table.

00:04:48.435 --> 00:04:49.636
So that's our very first operation.

00:04:49.636 --> 00:04:51.876
There will be more operations that our handler

00:04:51.876 --> 00:04:52.196
does,

00:04:52.196 --> 00:04:53.556
but that's going to be the first one.

00:04:53.716 --> 00:04:54.596
So if you remember,

00:04:54.676 --> 00:04:55.556
all of our

00:04:56.466 --> 00:04:57.686
all of our actual,

00:04:57.836 --> 00:05:01.116
actual database operations we put in a package so

00:05:01.116 --> 00:05:02.556
we can share them across different

00:05:03.226 --> 00:05:03.916
implementations,

00:05:03.916 --> 00:05:05.436
so across different applications.

00:05:05.516 --> 00:05:08.716
So inside of our data ops package we can head over

00:05:08.716 --> 00:05:10.396
to the queries links

00:05:10.796 --> 00:05:12.036
and at the very bottom.

00:05:12.036 --> 00:05:12.795
Let's go ahead.

00:05:12.795 --> 00:05:14.316
I'm just going to copy this in for now.

00:05:14.316 --> 00:05:16.156
We're going to create a method called add link

00:05:16.156 --> 00:05:16.716
clicks.

00:05:16.876 --> 00:05:19.636
And Add link clicks is going to ensure that it

00:05:19.636 --> 00:05:22.316
takes the data from the schema that we've defined

00:05:22.316 --> 00:05:23.196
inside of our

00:05:23.716 --> 00:05:25.076
ZOD schema for the queue

00:05:25.476 --> 00:05:26.116
and then

00:05:26.596 --> 00:05:29.076
it's going to be using this specific table.

00:05:29.466 --> 00:05:30.976
this is our drizzle table.

00:05:30.976 --> 00:05:33.136
Link clicks and then it's just passing in the

00:05:33.136 --> 00:05:33.616
basic information.

00:05:33.616 --> 00:05:34.216
Account id,

00:05:34.216 --> 00:05:34.736
destination,

00:05:34.736 --> 00:05:35.096
country,

00:05:35.096 --> 00:05:35.416
click,

00:05:35.416 --> 00:05:35.616
time,

00:05:35.616 --> 00:05:36.016
latitude,

00:05:36.016 --> 00:05:36.416
longitude.

00:05:36.416 --> 00:05:37.816
This is the data that we're sending into the

00:05:37.816 --> 00:05:38.176
queue.

00:05:38.546 --> 00:05:40.306
there's no manipulation needed from here.

00:05:40.306 --> 00:05:41.906
This is just basically getting that information

00:05:42.306 --> 00:05:43.986
and inserting it into our table.

00:05:44.066 --> 00:05:46.746
Now make sure you CD into your package so you can

00:05:46.746 --> 00:05:47.666
properly build this.

00:05:48.386 --> 00:05:50.066
So we're going to go into packages,

00:05:51.026 --> 00:05:51.346
cd,

00:05:51.426 --> 00:05:52.386
Data Ops,

00:05:52.706 --> 00:05:53.626
pnpm,

00:05:53.626 --> 00:05:54.466
run build.

00:05:54.466 --> 00:05:55.586
That's going to build this.

00:05:55.746 --> 00:05:56.626
Make sure you build.

00:05:56.706 --> 00:05:58.706
It's very critical to build just so

00:05:59.106 --> 00:05:59.506
you,

00:05:59.586 --> 00:05:59.946
your

00:05:59.946 --> 00:06:02.446
applications will have access to this add link

00:06:02.446 --> 00:06:03.166
click method.

00:06:03.166 --> 00:06:05.406
So I'm going to head back into our

00:06:05.706 --> 00:06:06.856
actual application,

00:06:07.176 --> 00:06:09.896
our data service and we are in our data service

00:06:09.896 --> 00:06:11.496
now so we can go over here.

00:06:11.656 --> 00:06:12.056
And

00:06:12.496 --> 00:06:14.856
what I'm going to do is I'm going to create,

00:06:15.656 --> 00:06:16.576
I actually already created this.

00:06:16.576 --> 00:06:17.816
I'm going to delete this really quick.

00:06:17.816 --> 00:06:19.896
So we are going to create a

00:06:19.999 --> 00:06:20.639
folder

00:06:20.959 --> 00:06:21.359
called

00:06:21.779 --> 00:06:23.899
that is called Q handlers

00:06:25.259 --> 00:06:28.059
and queue handlers is going to contain all of the

00:06:28.219 --> 00:06:30.299
different like logic that we're going to implement

00:06:30.299 --> 00:06:32.379
whenever you build out like logic to process data

00:06:32.379 --> 00:06:33.099
from a queue.

00:06:33.499 --> 00:06:34.859
So I'm going to call this the

00:06:35.179 --> 00:06:35.659
link

00:06:36.349 --> 00:06:36.829
click.

00:06:36.829 --> 00:06:37.149
So this,

00:06:37.149 --> 00:06:39.629
this handler is the link clicks handler.

00:06:43.109 --> 00:06:46.029
And right now this handler is going to take in

00:06:46.029 --> 00:06:46.629
some data here.

00:06:46.629 --> 00:06:47.829
So it's going to take in

00:06:48.229 --> 00:06:51.109
the event which is the event type received by the

00:06:51.109 --> 00:06:51.509
queue

00:06:52.309 --> 00:06:54.229
and then it is going to

00:06:54.609 --> 00:06:56.669
use this database method that we just defined

00:06:56.669 --> 00:06:58.829
inside of our package called add link click.

00:06:58.909 --> 00:07:02.189
And you can see that it got imported from our repo

00:07:02.189 --> 00:07:04.749
data ops which is our package queries link.

00:07:04.749 --> 00:07:06.349
So this is the method that we just defined.

00:07:06.429 --> 00:07:09.549
So this is kind of just like a wrapper around a

00:07:09.549 --> 00:07:10.669
database call for now.

00:07:10.729 --> 00:07:12.799
but in the future this method is going,

00:07:12.799 --> 00:07:15.199
this add link click method is going to handle

00:07:15.199 --> 00:07:16.439
different types of operations.

00:07:16.439 --> 00:07:18.479
One is going to save data into a queue.

00:07:18.639 --> 00:07:18.999
Two,

00:07:18.999 --> 00:07:21.199
it's probably going to interface with a workflow,

00:07:21.199 --> 00:07:23.199
it's going to interface with durable objects and

00:07:23.199 --> 00:07:25.279
there's just going to be like an entire cascade,

00:07:25.629 --> 00:07:26.739
cascading amount of

00:07:27.309 --> 00:07:28.949
or the data is just going to kind of cascade

00:07:28.949 --> 00:07:30.789
across different type of handlers to like do

00:07:30.789 --> 00:07:32.429
different things as we build out more features.

00:07:32.429 --> 00:07:33.629
So for now it's simple.

00:07:33.709 --> 00:07:34.669
We're passing in env.

00:07:34.829 --> 00:07:35.949
We're not using it right now,

00:07:35.949 --> 00:07:37.469
but we will be using it in the future.

00:07:37.549 --> 00:07:40.429
So just note that so we can head back over to our

00:07:40.429 --> 00:07:40.869
index.

00:07:40.869 --> 00:07:42.569
TS Looks like we have a

00:07:43.279 --> 00:07:43.729
error here.

00:07:43.729 --> 00:07:45.129
And then I am just going to say

00:07:45.609 --> 00:07:46.249
await,

00:07:47.609 --> 00:07:50.609
we can import this handling click and then pass in

00:07:50.609 --> 00:07:53.049
this emv and then we're going to pass in our

00:07:53.049 --> 00:07:53.369
event.

00:07:53.449 --> 00:07:56.129
So this is our parsed event and it is of a

00:07:56.129 --> 00:07:58.689
specific type and that type is the same that is

00:07:58.689 --> 00:07:59.609
needed by our handler.

00:07:59.769 --> 00:08:02.169
So just to kind of recap here we have a producer

00:08:02.169 --> 00:08:04.089
since data queue the queue,

00:08:04.249 --> 00:08:06.209
get that data on a queue gets picked up by our

00:08:06.209 --> 00:08:06.649
consumer,

00:08:06.649 --> 00:08:07.849
which is implemented here.

00:08:08.089 --> 00:08:10.489
We are going to do some parsing to make sure all

00:08:10.489 --> 00:08:12.969
of the data that enters this queue is of a certain

00:08:12.969 --> 00:08:13.549
type type.

00:08:13.549 --> 00:08:14.549
If we don't know the type,

00:08:14.549 --> 00:08:15.389
we don't know that data.

00:08:15.389 --> 00:08:16.869
We don't want to process it because it's just

00:08:16.869 --> 00:08:18.069
going to mess things up in our system.

00:08:18.499 --> 00:08:19.209
if it's a success,

00:08:19.369 --> 00:08:21.289
if we successfully parse that message,

00:08:21.449 --> 00:08:23.729
we're going to go take a look at the type of event

00:08:23.729 --> 00:08:25.689
that it is and based upon the type we're going to

00:08:25.689 --> 00:08:26.729
pass it into a handler.

00:08:26.729 --> 00:08:29.289
And this handler right now is just sticking data

00:08:29.529 --> 00:08:31.449
in this data and in this table.

00:08:31.689 --> 00:08:33.649
So let's go ahead and deploy this pnpm,

00:08:33.649 --> 00:08:33.929
run,

00:08:34.969 --> 00:08:35.529
deploy

00:08:36.489 --> 00:08:38.449
and while this is deploying you can head over to

00:08:38.449 --> 00:08:39.129
your ui.

00:08:40.119 --> 00:08:41.239
just make sure that you

00:08:41.719 --> 00:08:42.119
get

00:08:42.439 --> 00:08:44.839
the like go to one of your links,

00:08:45.319 --> 00:08:45.719
find

00:08:46.279 --> 00:08:49.719
the ID for that link and eventually we're going to

00:08:49.719 --> 00:08:51.559
have the UI is going to be a little bit better,

00:08:51.559 --> 00:08:54.319
so we'll be able to copy it and whatnot and then

00:08:54.319 --> 00:08:56.199
go to the URL for your data service.

00:08:56.519 --> 00:08:57.279
So we're going to go,

00:08:57.279 --> 00:08:57.879
data service.

00:08:58.279 --> 00:09:00.279
I'm going to pass this right here and I'm going to

00:09:00.279 --> 00:09:00.759
hit enter.

00:09:01.159 --> 00:09:03.879
Now we redirected to Google and within a few

00:09:03.879 --> 00:09:05.959
seconds that queue should process

00:09:07.129 --> 00:09:07.529
the data

00:09:07.849 --> 00:09:10.729
and it should stick it in this link clicks table.

00:09:10.729 --> 00:09:11.769
So when we run this again,

00:09:11.769 --> 00:09:13.449
you can see we have data

00:09:13.639 --> 00:09:15.149
that actually made it into our queue,

00:09:15.149 --> 00:09:16.029
which is really nice.

00:09:16.189 --> 00:09:16.589
So

00:09:17.439 --> 00:09:19.359
just to kind of recap data flow,

00:09:19.359 --> 00:09:21.039
we have our producer which

00:09:21.359 --> 00:09:21.759
is

00:09:22.529 --> 00:09:24.689
being used inside of our redirect service,

00:09:24.929 --> 00:09:26.649
sending data to the queue.

00:09:26.649 --> 00:09:27.569
The queue is being

00:09:27.739 --> 00:09:29.659
the data from the queue is being picked up from a

00:09:29.659 --> 00:09:31.579
consumer and the consumer is taking that data and

00:09:31.579 --> 00:09:33.139
sticking it into a database.

00:09:33.139 --> 00:09:34.769
So that's what we have now.

00:09:34.769 --> 00:09:36.679
we kind of have like an end to end flow working

00:09:36.679 --> 00:09:36.999
now.

00:09:36.999 --> 00:09:37.359
So

00:09:37.659 --> 00:09:39.499
from here once you get to this point in building

00:09:39.499 --> 00:09:40.299
an application,

00:09:40.539 --> 00:09:42.939
you kind of have like all the foundation built out

00:09:43.099 --> 00:09:46.139
and you'll be able to implement really quickly new

00:09:46.139 --> 00:09:46.579
features.

00:09:46.579 --> 00:09:47.659
So like if you,

00:09:47.659 --> 00:09:50.059
if you want to add more logic into the handler,

00:09:50.059 --> 00:09:51.099
it's very modular,

00:09:51.099 --> 00:09:52.779
you can add logic into the new handler.

00:09:52.779 --> 00:09:54.779
If you want to add different types of events,

00:09:54.799 --> 00:09:55.719
that do different things,

00:09:55.719 --> 00:09:57.039
you can send it to the same queue,

00:09:57.119 --> 00:09:58.559
you can implement a new handler.

00:09:59.039 --> 00:10:01.079
and the thing that I really like about it is as

00:10:01.079 --> 00:10:03.079
your project grows and you start bringing on new

00:10:03.079 --> 00:10:03.679
team members,

00:10:03.679 --> 00:10:04.439
you can say like,

00:10:04.439 --> 00:10:04.879
okay,

00:10:04.879 --> 00:10:06.759
these guys are just focused on like,

00:10:06.759 --> 00:10:07.839
kind of like the front end,

00:10:08.099 --> 00:10:09.039
lightweight backend.

00:10:09.039 --> 00:10:10.919
They interface with the database and then all

00:10:10.919 --> 00:10:11.799
these data operations.

00:10:11.799 --> 00:10:12.999
Maybe you have another guy that's like,

00:10:12.999 --> 00:10:13.239
okay,

00:10:13.239 --> 00:10:15.199
I'm going to really build out

00:10:15.279 --> 00:10:17.139
all these features on the back end and I'm going

00:10:17.139 --> 00:10:17.579
to make sure like,

00:10:17.579 --> 00:10:18.339
they're really modular,

00:10:18.339 --> 00:10:19.139
really testable,

00:10:19.459 --> 00:10:20.339
really professional.

00:10:20.339 --> 00:10:22.739
And it's like kind of like this contract in the

00:10:22.739 --> 00:10:23.579
middle where you can say like,

00:10:23.579 --> 00:10:23.899
okay,

00:10:23.899 --> 00:10:25.459
you guys that are working on the front end,

00:10:25.459 --> 00:10:26.259
make sure the data,

00:10:26.559 --> 00:10:28.279
that's put onto this queue is of this specific

00:10:28.279 --> 00:10:29.359
type and

00:10:29.919 --> 00:10:31.439
send it to me under these conditions.

00:10:31.439 --> 00:10:33.439
And then I'm going to build out all this logic.

00:10:33.439 --> 00:10:35.319
So in parallel you can start building like really

00:10:35.319 --> 00:10:36.719
advanced features and systems.

00:10:37.119 --> 00:10:37.959
So it's great for like,

00:10:37.959 --> 00:10:38.639
small projects,

00:10:38.639 --> 00:10:41.139
but it can actually grow into larger projects as

00:10:41.139 --> 00:10:41.419
well.

00:10:41.419 --> 00:10:44.059
So this is kind of why I enjoy queues and why I

00:10:44.059 --> 00:10:44.339
think it's

00:10:44.559 --> 00:10:45.239
kind of like a

00:10:45.559 --> 00:10:46.479
overlooked,

00:10:46.479 --> 00:10:47.159
underused,

00:10:47.619 --> 00:10:50.439
mechanism in a lot of full stack projects and why

00:10:50.439 --> 00:10:51.759
I think more people should use it.

00:10:51.839 --> 00:10:53.079
So in this next video,

00:10:53.079 --> 00:10:54.079
we're going to dive deeper,

00:10:54.079 --> 00:10:55.639
specifically into the Cloudflare queue,

00:10:55.639 --> 00:10:57.599
and we're going to look at different configuration

00:10:57.599 --> 00:10:59.719
options that they provide us that are on the more

00:10:59.719 --> 00:11:00.385
advanced side.

