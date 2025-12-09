WEBVTT
X-TIMESTAMP-MAP=LOCAL:00:00:00.000,MPEGTS:900000

00:00:00.050 --> 00:00:00.370
All right,

00:00:00.370 --> 00:00:01.410
so let's talk about testing.

00:00:01.410 --> 00:00:03.330
I know a lot of developers are like people that

00:00:03.330 --> 00:00:04.210
are kind of new to the space.

00:00:04.290 --> 00:00:05.730
They don't love testing.

00:00:05.800 --> 00:00:06.190
and

00:00:06.510 --> 00:00:07.110
honestly,

00:00:07.110 --> 00:00:08.670
sometimes I don't like testing either.

00:00:08.670 --> 00:00:11.030
But it can be really important depending on the

00:00:11.030 --> 00:00:12.270
type of code that you're writing.

00:00:12.270 --> 00:00:12.670
Now,

00:00:12.670 --> 00:00:13.790
testing is very broad.

00:00:14.110 --> 00:00:15.030
We have like,

00:00:15.030 --> 00:00:15.430
you know,

00:00:15.430 --> 00:00:17.630
UI based tests where you're going to write these

00:00:17.630 --> 00:00:19.790
automated scripts that render virtual browsers,

00:00:19.790 --> 00:00:20.670
render ui,

00:00:20.670 --> 00:00:21.470
click on buttons,

00:00:21.470 --> 00:00:22.270
make sure things happen.

00:00:22.720 --> 00:00:24.360
I'm less fond of those tests.

00:00:24.360 --> 00:00:25.680
I know they can be very useful,

00:00:25.680 --> 00:00:27.040
especially for larger projects.

00:00:27.040 --> 00:00:27.360
But,

00:00:27.660 --> 00:00:29.380
what I'm kind of more interested in is actually

00:00:29.380 --> 00:00:31.940
testing the backend code and writing very specific

00:00:31.940 --> 00:00:32.700
unit tests.

00:00:32.700 --> 00:00:32.860
Now,

00:00:32.860 --> 00:00:33.860
there's kind of like two

00:00:34.260 --> 00:00:36.420
ways I like to think about writing tests.

00:00:36.420 --> 00:00:38.180
So if we look at our code,

00:00:38.500 --> 00:00:40.900
we have inside this index ts,

00:00:40.900 --> 00:00:41.620
this is the data,

00:00:41.700 --> 00:00:42.580
the data service,

00:00:42.640 --> 00:00:42.920
project,

00:00:42.920 --> 00:00:43.520
by the way.

00:00:43.960 --> 00:00:46.040
we essentially have this worker entry point that

00:00:46.040 --> 00:00:46.360
like,

00:00:46.360 --> 00:00:47.480
has a fetch handler,

00:00:47.480 --> 00:00:47.960
has a

00:00:48.230 --> 00:00:48.470
Q,

00:00:48.840 --> 00:00:50.173
and then it could have like a cron.

00:00:50.412 --> 00:00:52.852
Now I personally don't like testing at this level.

00:00:52.852 --> 00:00:53.092
Like,

00:00:53.092 --> 00:00:54.972
I don't like to write tests where you have this

00:00:54.972 --> 00:00:56.892
fetch handler and then you pass in data to the

00:00:56.892 --> 00:00:58.582
fetch handler and you expect something happens.

00:00:58.682 --> 00:00:59.202
because like,

00:00:59.202 --> 00:01:02.362
I kind of know with pretty much with certainty

00:01:02.362 --> 00:01:02.881
that like,

00:01:02.881 --> 00:01:04.282
this logic is fine.

00:01:04.392 --> 00:01:06.672
it's typically the business logic that lives

00:01:06.672 --> 00:01:08.992
inside of each route that I want to test.

00:01:09.072 --> 00:01:10.112
So to kind of like,

00:01:10.652 --> 00:01:12.892
describe this in a little more concrete terms.

00:01:13.562 --> 00:01:14.522
If you look at,

00:01:15.162 --> 00:01:16.582
Cloudflare's documentation on testing,

00:01:16.582 --> 00:01:17.382
they have this like,

00:01:17.382 --> 00:01:18.022
document for,

00:01:18.022 --> 00:01:18.182
like,

00:01:18.182 --> 00:01:19.342
how to test durable objects,

00:01:19.342 --> 00:01:19.902
for example.

00:01:19.902 --> 00:01:20.302
And

00:01:20.632 --> 00:01:22.642
you're kind of like spinning up a virtual worker

00:01:22.642 --> 00:01:23.762
inside your testing environment.

00:01:24.162 --> 00:01:25.322
And then you're kind of like saying,

00:01:25.322 --> 00:01:26.802
I'm going to go to my worker and I'm going to call

00:01:26.802 --> 00:01:27.241
Fetch.

00:01:27.241 --> 00:01:28.322
And then when I call Fetch,

00:01:28.322 --> 00:01:28.882
I expect

00:01:29.282 --> 00:01:30.242
some type of like,

00:01:30.242 --> 00:01:31.122
text to be returned.

00:01:31.122 --> 00:01:32.362
Now these can be useful,

00:01:32.362 --> 00:01:33.922
but I don't really love them.

00:01:34.102 --> 00:01:36.982
I like to kind of think about in two ways.

00:01:36.982 --> 00:01:37.302
So,

00:01:37.552 --> 00:01:38.442
inside of a queue,

00:01:38.792 --> 00:01:39.992
because if you're using TypeScript,

00:01:39.992 --> 00:01:41.152
you're kind of able to say like,

00:01:41.152 --> 00:01:41.352
okay,

00:01:41.352 --> 00:01:43.352
I'm going to iterate through a batch of messages.

00:01:43.432 --> 00:01:45.272
I don't really care about testing this.

00:01:45.332 --> 00:01:47.352
I don't need to pass in a batch of messages here.

00:01:47.772 --> 00:01:48.372
then we have

00:01:48.692 --> 00:01:51.692
a safe parse for the body and we basically are

00:01:51.692 --> 00:01:52.092
going to check,

00:01:52.092 --> 00:01:52.252
like,

00:01:52.252 --> 00:01:53.452
if we parsed it,

00:01:53.452 --> 00:01:55.252
then we're going to start processing it.

00:01:55.252 --> 00:01:57.932
Now this is kind of where I would want to test my

00:01:57.932 --> 00:01:58.932
code is at this level.

00:01:58.932 --> 00:02:01.052
So like we write some business logic in this

00:02:01.052 --> 00:02:01.492
handler.

00:02:01.492 --> 00:02:02.932
This is kind of where I would start my task.

00:02:02.932 --> 00:02:05.092
Like I would go from the top level of the handler.

00:02:05.092 --> 00:02:05.892
And if you have like

00:02:06.352 --> 00:02:07.632
logic inside of a handler,

00:02:07.632 --> 00:02:09.472
you can also test those in isolation too.

00:02:09.472 --> 00:02:10.432
Now this is

00:02:10.832 --> 00:02:11.312
a very,

00:02:11.312 --> 00:02:12.312
very simple handler.

00:02:12.312 --> 00:02:13.792
There's really no logic happening.

00:02:13.792 --> 00:02:14.832
It's just kind of like

00:02:15.232 --> 00:02:16.912
sending data to a database,

00:02:16.912 --> 00:02:17.272
you know,

00:02:17.272 --> 00:02:20.352
and then this one is like calling a workflow.

00:02:20.432 --> 00:02:22.352
So there's really not a ton to test.

00:02:22.352 --> 00:02:24.112
But I did write a test out just

00:02:24.432 --> 00:02:26.112
to kind of like show what that would look like.

00:02:26.112 --> 00:02:27.472
So you can kind of think about it as like,

00:02:27.472 --> 00:02:28.432
if you want to test this,

00:02:28.862 --> 00:02:30.982
you're going to want to make sure like you're not

00:02:30.982 --> 00:02:32.582
actually going to write anything to the database.

00:02:32.582 --> 00:02:33.742
You're going to kind of mock

00:02:34.462 --> 00:02:35.942
that interaction with the database.

00:02:35.942 --> 00:02:36.182
So like,

00:02:36.182 --> 00:02:37.422
if the database returns data,

00:02:37.422 --> 00:02:38.462
you can mock a,

00:02:38.462 --> 00:02:39.342
like return data.

00:02:40.442 --> 00:02:41.722
so inside of tests

00:02:42.202 --> 00:02:43.962
we can go to our queue handler and then we have

00:02:43.962 --> 00:02:44.922
this link clicks test.

00:02:45.002 --> 00:02:48.042
TS now essentially what we've done here is we are

00:02:48.122 --> 00:02:49.921
going into our data ops,

00:02:49.921 --> 00:02:50.442
queries,

00:02:50.442 --> 00:02:52.482
links and then we're just finding this method link

00:02:52.482 --> 00:02:52.842
click,

00:02:52.842 --> 00:02:55.202
which we're utilizing here and we're mocking it

00:02:55.202 --> 00:02:55.482
out.

00:02:55.482 --> 00:02:56.962
So essentially nothing happens.

00:02:56.962 --> 00:02:58.942
it's just writing data and nothing's happening.

00:02:59.052 --> 00:03:02.012
and then similar into our helper routes we have

00:03:02.012 --> 00:03:04.572
this schedule workflow which is also just going to

00:03:04.572 --> 00:03:06.492
be like kind of mocking that out.

00:03:06.492 --> 00:03:07.052
then we

00:03:07.642 --> 00:03:11.322
have a specific test here where we set up a mock

00:03:11.322 --> 00:03:11.642
event

00:03:12.122 --> 00:03:14.362
and this is going to be some data that like dummy

00:03:14.362 --> 00:03:15.922
data that we can pass into our tests.

00:03:15.922 --> 00:03:19.482
And then before each test runs we're going to say

00:03:19.641 --> 00:03:22.122
we're going to clear out like all like the mocked

00:03:22.122 --> 00:03:22.442
data.

00:03:22.502 --> 00:03:24.302
it's going to kind of reset all those mocks.

00:03:24.302 --> 00:03:24.702
Now,

00:03:25.102 --> 00:03:27.122
from here what we can do is this is it.

00:03:27.122 --> 00:03:28.402
If you haven't ever tested before,

00:03:28.562 --> 00:03:29.682
this is a test,

00:03:29.892 --> 00:03:30.412
semantic.

00:03:30.412 --> 00:03:32.372
So inside of describe you can say it,

00:03:32.772 --> 00:03:33.972
give it a test name.

00:03:34.132 --> 00:03:36.372
And then we're going to pass in our mock

00:03:36.372 --> 00:03:37.732
environment in our mock event.

00:03:37.892 --> 00:03:39.812
And then what we expect is

00:03:40.212 --> 00:03:43.092
that add link click was called with

00:03:43.342 --> 00:03:44.731
with the event data.

00:03:44.972 --> 00:03:46.172
So internally

00:03:46.572 --> 00:03:47.852
this code is

00:03:47.888 --> 00:03:48.539
getting some,

00:03:48.539 --> 00:03:50.739
is getting this link click event and it's passing

00:03:50.739 --> 00:03:51.139
in data.

00:03:51.139 --> 00:03:52.699
So like this test is very stupid.

00:03:52.699 --> 00:03:54.219
Like there isn't really a lot happening.

00:03:54.219 --> 00:03:56.219
It's just kind of to showcase that like if there

00:03:56.219 --> 00:03:57.139
was more logic here,

00:03:57.139 --> 00:03:59.489
like we were parsing out values and manipul

00:03:59.959 --> 00:04:02.039
the Data and then like formatting it in a specific

00:04:02.039 --> 00:04:02.239
way.

00:04:02.239 --> 00:04:04.279
You could kind of do these like tests where you

00:04:04.279 --> 00:04:06.559
have some input and you expect some output or you

00:04:06.559 --> 00:04:07.479
expect the input

00:04:07.879 --> 00:04:10.879
of a internal method inside of like some function

00:04:10.879 --> 00:04:12.919
that you have is going to be called with data.

00:04:12.999 --> 00:04:15.199
So imagine if this was a more complex scenario,

00:04:15.199 --> 00:04:16.599
this would be a more useful test.

00:04:16.639 --> 00:04:16.859
and then,

00:04:16.859 --> 00:04:17.139
you know,

00:04:17.139 --> 00:04:19.379
we have a few other things here where we have our

00:04:19.379 --> 00:04:21.219
workflow and then we're just going to basically

00:04:21.299 --> 00:04:21.699
say

00:04:22.278 --> 00:04:23.140
our workflow.

00:04:23.146 --> 00:04:25.306
This is basically asserting some order.

00:04:25.306 --> 00:04:28.266
So like we're basically saying like imagine we

00:04:28.266 --> 00:04:31.706
have logic where we need to insert the data into

00:04:31.706 --> 00:04:34.346
the database before some other section of logic

00:04:34.346 --> 00:04:34.786
happens.

00:04:34.786 --> 00:04:36.746
Because this is maybe dependent upon data being in

00:04:36.746 --> 00:04:37.186
the database.

00:04:37.186 --> 00:04:37.786
For example,

00:04:38.196 --> 00:04:38.446
this,

00:04:38.446 --> 00:04:39.966
this type of test is going to be

00:04:40.366 --> 00:04:42.726
basically saying I'm going to mock out the link

00:04:42.726 --> 00:04:43.046
click.

00:04:43.046 --> 00:04:44.286
And then also our

00:04:44.756 --> 00:04:45.556
also our

00:04:45.876 --> 00:04:46.516
workflow.

00:04:46.516 --> 00:04:49.196
And then we're going to process that link click.

00:04:49.196 --> 00:04:50.996
And then we're going to say the link click

00:04:51.286 --> 00:04:51.686
mock.

00:04:51.766 --> 00:04:54.366
So that insert into the database should have been

00:04:54.366 --> 00:04:55.686
called before the workflow.

00:04:55.686 --> 00:04:56.766
So like this another example.

00:04:56.766 --> 00:04:57.686
Now these aren't just,

00:04:57.686 --> 00:04:58.686
these aren't super useful.

00:04:58.686 --> 00:05:00.486
I just think it's really good to kind of see

00:05:00.806 --> 00:05:02.206
how you could set things up and structure it.

00:05:02.206 --> 00:05:04.846
And then if you were to expand this code to like

00:05:04.926 --> 00:05:06.766
handle more like complex use cases,

00:05:07.006 --> 00:05:09.086
you could use this as a framework to enhance these

00:05:09.086 --> 00:05:10.366
tests for those use cases.

00:05:11.036 --> 00:05:12.716
and this is just another simple like

00:05:13.096 --> 00:05:14.886
one where we're basically throwing a database

00:05:14.886 --> 00:05:15.326
error.

00:05:15.566 --> 00:05:15.966
So

00:05:16.416 --> 00:05:18.816
when we are saving some data into the database

00:05:18.896 --> 00:05:19.696
right here,

00:05:20.176 --> 00:05:20.776
add link,

00:05:20.776 --> 00:05:21.008
click,

00:05:21.082 --> 00:05:23.202
it's basically saying that's going to throw an

00:05:23.202 --> 00:05:23.602
error.

00:05:23.602 --> 00:05:23.962
So

00:05:24.122 --> 00:05:26.322
this is saying we're expecting handling click to

00:05:26.322 --> 00:05:28.042
throw this database error.

00:05:28.042 --> 00:05:29.882
And if that database error is thrown,

00:05:30.282 --> 00:05:30.682
then

00:05:31.082 --> 00:05:34.042
this section of code should not have been run.

00:05:34.122 --> 00:05:34.522
Now,

00:05:34.854 --> 00:05:35.621
now like,

00:05:35.701 --> 00:05:38.181
I guess one way to think about it is like if this

00:05:38.181 --> 00:05:39.421
doesn't depend on add link,

00:05:39.421 --> 00:05:39.741
click,

00:05:39.741 --> 00:05:41.661
maybe you throw these in like some try catch

00:05:41.661 --> 00:05:42.141
handler.

00:05:42.141 --> 00:05:43.261
So even if this fails,

00:05:43.261 --> 00:05:44.781
you can still go ahead and run that workflow.

00:05:44.781 --> 00:05:45.531
Like it depends on

00:05:45.841 --> 00:05:46.761
your business logic.

00:05:46.761 --> 00:05:48.081
But if that's the case,

00:05:48.561 --> 00:05:50.761
instead of saying we expect this not to be called,

00:05:50.761 --> 00:05:52.401
if this first method throws an error,

00:05:52.401 --> 00:05:53.801
we could say even if this throws an error,

00:05:53.801 --> 00:05:55.121
we still expect this to be called.

00:05:55.281 --> 00:05:55.681
So

00:05:55.721 --> 00:05:57.221
these are just kind of like some different ways to

00:05:57.221 --> 00:05:58.821
handle these unit tests.

00:05:59.271 --> 00:05:59.671
so

00:05:59.991 --> 00:06:02.351
this is like the one way I like to think about it.

00:06:02.351 --> 00:06:04.231
These are most of the tests that I write are stuff

00:06:04.231 --> 00:06:06.111
like this where you're kind of just like testing

00:06:06.111 --> 00:06:06.391
the,

00:06:06.551 --> 00:06:08.311
giving some input to a function and then

00:06:09.501 --> 00:06:10.981
asserting what the behavior is.

00:06:10.981 --> 00:06:12.838
After that the data is passed into a function.

00:06:13.116 --> 00:06:15.796
Now the slightly more complicated tests are going

00:06:15.796 --> 00:06:17.236
to be if you have like,

00:06:17.236 --> 00:06:18.876
let's say you're building on top of durable

00:06:18.876 --> 00:06:21.956
objects and this durable object actually has a lot

00:06:21.956 --> 00:06:23.996
of business logic embedded inside the class.

00:06:24.076 --> 00:06:26.316
Now I don't love writing code this way.

00:06:26.316 --> 00:06:28.276
I kind of like to break things outside of the

00:06:28.276 --> 00:06:30.436
durable object and just use the durable object for

00:06:30.436 --> 00:06:31.796
like alarm scheduling and whatnot.

00:06:31.796 --> 00:06:33.356
But sometimes if you're really,

00:06:33.356 --> 00:06:35.516
really using the features of the durable object,

00:06:35.836 --> 00:06:38.156
your logic is going to be pretty like embedded

00:06:38.156 --> 00:06:38.956
inside of this class,

00:06:39.376 --> 00:06:41.136
similar to what we have here inside of the link

00:06:41.136 --> 00:06:41.936
click tracker.

00:06:41.936 --> 00:06:42.256
Now

00:06:43.136 --> 00:06:45.496
what you're going to notice is like whenever we

00:06:45.496 --> 00:06:46.696
call add link click,

00:06:46.696 --> 00:06:47.616
we would expect

00:06:48.016 --> 00:06:48.416
that,

00:06:48.496 --> 00:06:50.376
we'd expect that some data is saved into a

00:06:50.376 --> 00:06:52.696
database and then we would also say expect that if

00:06:52.696 --> 00:06:53.696
there is no alarm,

00:06:53.856 --> 00:06:54.256
that

00:06:55.676 --> 00:06:56.276
is being called.

00:06:56.276 --> 00:06:58.556
And then there's like some other like very

00:06:58.556 --> 00:06:59.156
specific

00:06:59.476 --> 00:07:01.516
bits of logic in here that we can go over in just

00:07:01.516 --> 00:07:01.836
a second.

00:07:01.836 --> 00:07:03.956
But essentially when you're writing these types of

00:07:03.956 --> 00:07:04.436
tests,

00:07:04.727 --> 00:07:05.207
what we're,

00:07:05.207 --> 00:07:06.647
what I like to do is

00:07:07.127 --> 00:07:09.447
I like to basically take all of the

00:07:09.627 --> 00:07:10.327
dependencies.

00:07:10.327 --> 00:07:12.967
So like all of the like helper methods that

00:07:12.967 --> 00:07:15.367
require actual IO connection to the database,

00:07:15.367 --> 00:07:16.967
connection to API calls,

00:07:16.967 --> 00:07:19.167
and I like to mock those out so we can like

00:07:19.167 --> 00:07:20.007
manually add

00:07:20.127 --> 00:07:22.133
return values whether it throws an error or not.

00:07:22.134 --> 00:07:22.811
Now in terms of,

00:07:22.811 --> 00:07:23.811
in terms of actually

00:07:24.211 --> 00:07:25.971
testing out the durable object,

00:07:26.451 --> 00:07:28.971
essentially what we're going to want to do is you

00:07:28.971 --> 00:07:29.131
know,

00:07:29.131 --> 00:07:30.891
you're going to have to actually mock out the

00:07:30.891 --> 00:07:32.371
durable object itself.

00:07:32.531 --> 00:07:34.731
So the durable object has a bunch of like internal

00:07:34.731 --> 00:07:36.211
APIs that require the

00:07:36.611 --> 00:07:36.641
Cloudflare

00:07:37.111 --> 00:07:37.671
runtime

00:07:39.371 --> 00:07:42.051
like it depends on the Cloudflare runtime and they

00:07:42.051 --> 00:07:44.251
do have some like information about testing and

00:07:44.251 --> 00:07:45.051
how to like use

00:07:45.991 --> 00:07:47.871
different like libraries that they can provide for

00:07:47.871 --> 00:07:48.591
helping with testing.

00:07:48.591 --> 00:07:50.911
But I've always found it a lot easier to just kind

00:07:50.911 --> 00:07:52.991
of like mock out the logic that you care about

00:07:52.991 --> 00:07:54.671
because I mostly am trying to test the business

00:07:54.671 --> 00:07:57.231
logic and not like the actual functionality,

00:07:57.231 --> 00:07:59.271
lower level functionality of the durable object.

00:08:00.791 --> 00:08:03.111
Now if you actually need to go that deep into your

00:08:03.111 --> 00:08:03.831
test you,

00:08:03.831 --> 00:08:05.631
there's a lot of documentation out there on how to

00:08:05.631 --> 00:08:05.871
do it,

00:08:05.871 --> 00:08:07.791
but I just don't think it's like crazy easy.

00:08:07.791 --> 00:08:10.151
And I kind of prefer to just say hey,

00:08:10.231 --> 00:08:13.151
this is my durable object class and I'm going to

00:08:13.151 --> 00:08:14.271
test out the functionality.

00:08:14.271 --> 00:08:16.431
So I'm going to mock out the things that like are

00:08:16.431 --> 00:08:16.951
utilized.

00:08:16.951 --> 00:08:19.891
So you can see inside of the durable object class,

00:08:20.411 --> 00:08:21.771
we have like a SQL,

00:08:21.851 --> 00:08:25.051
we have like a SQL instance and that has like

00:08:25.051 --> 00:08:27.011
execute and you're able to run queries.

00:08:27.011 --> 00:08:28.491
You also have a storage API.

00:08:28.591 --> 00:08:30.851
there's kind of like this state management that is

00:08:30.851 --> 00:08:32.171
part of the durable object.

00:08:32.171 --> 00:08:34.091
And then also we have web sockets

00:08:34.411 --> 00:08:35.771
which are part of the

00:08:35.871 --> 00:08:36.421
API.

00:08:36.421 --> 00:08:38.701
So inside of this test you're going to notice that

00:08:39.001 --> 00:08:41.101
we're going to be mocking a lot of this stuff out.

00:08:41.101 --> 00:08:43.661
So like we are mocking out the SQL Storage API.

00:08:43.661 --> 00:08:44.061
So

00:08:44.301 --> 00:08:46.281
the execute database size cursor statement,

00:08:46.281 --> 00:08:48.061
all these things we're just kind of like mocking

00:08:48.061 --> 00:08:49.101
out what those would look like.

00:08:49.431 --> 00:08:49.831
similar.

00:08:49.831 --> 00:08:51.271
We're doing the same thing with the

00:08:51.651 --> 00:08:52.451
websocket

00:08:54.851 --> 00:08:57.291
and then also the state object where the storage

00:08:57.291 --> 00:09:00.211
is taking our like mock of the SQL storage and

00:09:00.211 --> 00:09:02.291
we're mocking out get input and whatnot.

00:09:02.691 --> 00:09:04.931
then essentially what that's what the tests are

00:09:04.931 --> 00:09:07.731
going to look like is we're kind of able to say

00:09:10.761 --> 00:09:13.281
we're kind of able to test logic like add link

00:09:13.281 --> 00:09:13.961
click here.

00:09:15.631 --> 00:09:18.031
So basically when add link click is called

00:09:18.681 --> 00:09:20.121
when add link click is called.

00:09:20.201 --> 00:09:21.721
In this test we're basically saying

00:09:22.041 --> 00:09:23.961
there already is an alarm scheduled.

00:09:23.961 --> 00:09:26.321
So when we add a link click and we add some data

00:09:26.321 --> 00:09:27.401
about that link click,

00:09:27.691 --> 00:09:28.211
we expect

00:09:28.691 --> 00:09:31.811
the SQL query to be called with this information.

00:09:32.131 --> 00:09:34.011
So you can see that's kind of what's happening

00:09:34.011 --> 00:09:34.371
here?

00:09:38.831 --> 00:09:40.551
so that test would be pretty straightforward.

00:09:40.551 --> 00:09:42.431
So if like we ever have a schema change,

00:09:42.431 --> 00:09:43.151
we'd also like,

00:09:43.151 --> 00:09:45.111
want to make sure we're updating the tests for

00:09:45.111 --> 00:09:45.391
that.

00:09:45.691 --> 00:09:47.851
And then we can have like another type of test

00:09:47.851 --> 00:09:48.781
where it should set

00:09:48.781 --> 00:09:50.891
an alarm if alarm doesn't exist.

00:09:50.971 --> 00:09:52.171
So if you look here,

00:09:52.171 --> 00:09:53.771
essentially we have a,

00:09:53.851 --> 00:09:56.691
we have this logic where we insert some data and

00:09:56.691 --> 00:09:57.051
then

00:09:57.371 --> 00:09:58.371
we get an alarm.

00:09:58.371 --> 00:09:58.971
And if there

00:09:59.291 --> 00:10:00.491
is no alarm,

00:10:00.491 --> 00:10:02.171
then we set an alarm here.

00:10:02.251 --> 00:10:03.251
So that's,

00:10:03.251 --> 00:10:04.971
we're kind of fabricating the same logic here.

00:10:04.971 --> 00:10:07.611
We're adding a link click and then we're expecting

00:10:07.611 --> 00:10:09.851
that get alarm should have been called.

00:10:10.571 --> 00:10:11.531
And the

00:10:12.321 --> 00:10:14.241
and the set alarm also should have been called

00:10:14.241 --> 00:10:15.761
because we're saying that the

00:10:16.201 --> 00:10:17.021
get alarm,

00:10:17.661 --> 00:10:19.181
the mocked value,

00:10:19.261 --> 00:10:22.381
so the value that's returned is going to be null.

00:10:22.621 --> 00:10:25.661
So essentially we expect if it is null that it

00:10:25.661 --> 00:10:27.101
should be called with this number.

00:10:27.341 --> 00:10:27.741
Now

00:10:31.741 --> 00:10:33.901
the inverse of that would basically be saying when

00:10:33.901 --> 00:10:35.021
get alarm is called,

00:10:35.101 --> 00:10:37.101
we're going to say there is an assigned value to

00:10:37.101 --> 00:10:37.341
it.

00:10:37.971 --> 00:10:39.331
So inside of this logic,

00:10:39.331 --> 00:10:40.051
if a

00:10:40.861 --> 00:10:41.941
link click happens,

00:10:41.941 --> 00:10:43.701
we do expect that if this,

00:10:43.701 --> 00:10:45.101
if there's some data returned here,

00:10:45.101 --> 00:10:47.701
we don't call this set alarm logic.

00:10:47.701 --> 00:10:48.781
And that's kind of what's happening here.

00:10:48.781 --> 00:10:50.381
We expect the get alarm to be called,

00:10:50.701 --> 00:10:51.101
but

00:10:51.651 --> 00:10:53.861
the set alarm state should not have been called.

00:10:54.021 --> 00:10:56.101
So that's kind of like in a nutshell,

00:10:56.101 --> 00:10:56.741
how to test

00:10:57.071 --> 00:10:58.681
like the logic inside of a durable object.

00:10:58.681 --> 00:10:59.281
As you notice,

00:10:59.281 --> 00:11:01.561
like we are mocking out a lot of like we're

00:11:01.561 --> 00:11:02.281
mocking out this.

00:11:02.281 --> 00:11:04.761
We're mocking out the get alarm and the store and

00:11:04.761 --> 00:11:05.801
the set alarm and whatnot.

00:11:07.571 --> 00:11:09.651
And then we're just kind of like in those tests

00:11:09.651 --> 00:11:11.411
we're saying if set alarm,

00:11:11.571 --> 00:11:12.971
if get alarm already has a value,

00:11:12.971 --> 00:11:14.611
set alarm should not be called kind of a thing.

00:11:14.611 --> 00:11:15.971
And that's how we're testing out some internal

00:11:15.971 --> 00:11:16.611
logic here.

00:11:18.451 --> 00:11:19.171
Now the

00:11:20.011 --> 00:11:22.331
this class actually has quite a bit of logic in

00:11:22.331 --> 00:11:22.531
it.

00:11:22.531 --> 00:11:24.651
So one of the things that we have is we have this

00:11:24.651 --> 00:11:25.211
alarm

00:11:25.531 --> 00:11:28.051
and this alarm is essentially like whenever we get

00:11:28.051 --> 00:11:28.571
link clicks,

00:11:28.571 --> 00:11:30.451
it's setting a buffer for a few seconds and then

00:11:30.451 --> 00:11:30.731
it

00:11:30.761 --> 00:11:31.031
or like,

00:11:31.031 --> 00:11:32.351
I think it's like two seconds and then it's

00:11:32.351 --> 00:11:34.231
sending that data down to WebSocket clients.

00:11:34.231 --> 00:11:35.471
So during that process,

00:11:35.631 --> 00:11:37.451
every two seconds we're going to go ahead and

00:11:37.451 --> 00:11:39.651
we're going to get like the most those link clicks

00:11:39.651 --> 00:11:41.051
that are kind of in the buffer.

00:11:41.531 --> 00:11:41.931
And

00:11:42.531 --> 00:11:44.171
we're going to go to every Single socket.

00:11:44.171 --> 00:11:46.091
And we're going to send some data back to those

00:11:46.091 --> 00:11:47.491
actual clients that are connected

00:11:47.891 --> 00:11:49.331
and then we're flushing the time.

00:11:49.331 --> 00:11:51.371
So we're basically saying we just process this

00:11:51.371 --> 00:11:52.571
little batch of link clicks.

00:11:52.571 --> 00:11:54.731
So now like we're moving that offset off to the

00:11:54.731 --> 00:11:55.891
top of the table.

00:11:56.051 --> 00:11:56.451
So,

00:11:56.641 --> 00:11:58.991
the buffer kind of like resets and then we're

00:11:58.991 --> 00:11:59.911
deleting some data.

00:11:59.991 --> 00:12:02.431
So a test for that would kind of look as follows.

00:12:02.431 --> 00:12:04.311
This one's like a little bit more involved where

00:12:04.731 --> 00:12:07.371
we are mocking the data that is in the table here.

00:12:09.111 --> 00:12:10.911
And then we're basically saying the get link

00:12:10.911 --> 00:12:13.031
clicks call is going to return this

00:12:13.231 --> 00:12:13.871
mock data.

00:12:14.431 --> 00:12:15.791
We're kind of mocking out

00:12:16.251 --> 00:12:16.651
different,

00:12:17.101 --> 00:12:17.661
sockets.

00:12:17.661 --> 00:12:20.061
So different like users that are connected to our

00:12:20.351 --> 00:12:20.751
client.

00:12:20.751 --> 00:12:21.911
So essentially we're saying there's,

00:12:21.911 --> 00:12:23.671
there's going to be two clients that are connected

00:12:23.671 --> 00:12:24.831
to our durable object.

00:12:28.571 --> 00:12:30.131
and then we're going to go ahead and say we're

00:12:30.131 --> 00:12:31.691
going to trigger this alarm.

00:12:31.691 --> 00:12:33.171
And then when we trigger that alarm,

00:12:33.171 --> 00:12:34.571
some different things should have happened.

00:12:34.571 --> 00:12:34.851
Like

00:12:35.261 --> 00:12:37.501
the get link click should have been called.

00:12:38.101 --> 00:12:40.121
we should have called the send method.

00:12:40.121 --> 00:12:42.601
So we should have basically tried to send some

00:12:42.601 --> 00:12:44.161
data of those link clicks,

00:12:44.521 --> 00:12:44.921
to

00:12:45.721 --> 00:12:46.121
the

00:12:46.421 --> 00:12:47.961
client one and client two.

00:12:47.961 --> 00:12:49.560
They both should have received that information

00:12:50.201 --> 00:12:51.561
and then we should have

00:12:51.881 --> 00:12:53.081
flushed the data.

00:12:53.651 --> 00:12:55.621
and these are like the new offsets that should

00:12:55.621 --> 00:12:56.661
have been called with the flush.

00:12:56.661 --> 00:12:58.901
So we're kind of tracking this like internal logic

00:12:58.901 --> 00:13:01.341
of which data is passed into these,

00:13:01.501 --> 00:13:02.751
into the flush method.

00:13:03.781 --> 00:13:05.661
and then obviously the link click should have been

00:13:05.661 --> 00:13:08.021
called or the delete clicks before this period of

00:13:08.021 --> 00:13:08.781
time should have been called.

00:13:08.781 --> 00:13:10.301
So this is kind of like testing,

00:13:10.301 --> 00:13:10.581
like

00:13:11.461 --> 00:13:13.581
given some type of output from a function,

00:13:13.581 --> 00:13:14.901
when that alarm is triggered,

00:13:14.901 --> 00:13:16.261
all of that cascading logic,

00:13:16.261 --> 00:13:16.821
what is happening?

00:13:16.821 --> 00:13:18.261
So I think this is actually a pretty good test.

00:13:18.261 --> 00:13:19.221
It's very involved.

00:13:19.221 --> 00:13:21.901
But it's also really important because if like

00:13:21.901 --> 00:13:23.741
somebody that you're working with comes in and

00:13:23.741 --> 00:13:26.341
they like change some core logic on this behavior,

00:13:26.501 --> 00:13:27.461
that test will fail.

00:13:27.621 --> 00:13:29.101
And then when that test fails,

00:13:29.101 --> 00:13:29.581
they'll be like,

00:13:29.581 --> 00:13:29.941
oh,

00:13:30.021 --> 00:13:31.021
why did that test fail?

00:13:31.021 --> 00:13:32.341
And they'll go through and they'll look at the

00:13:32.341 --> 00:13:33.701
logic of what should have happened and they'll be

00:13:33.701 --> 00:13:33.821
like,

00:13:33.821 --> 00:13:34.181
oh,

00:13:34.491 --> 00:13:35.651
I actually like change something.

00:13:35.651 --> 00:13:38.251
And then the delete logic is actually not working

00:13:38.251 --> 00:13:40.171
as expected or maybe we're not actually sending

00:13:40.171 --> 00:13:41.531
the right data to like the user.

00:13:41.531 --> 00:13:41.851
So,

00:13:42.091 --> 00:13:43.451
these are like the kind of tests where they're

00:13:43.451 --> 00:13:43.931
really involved,

00:13:43.931 --> 00:13:44.571
but they're also very,

00:13:44.571 --> 00:13:45.371
very useful.

00:13:46.331 --> 00:13:48.051
So that is testing in a nutshell.

00:13:48.051 --> 00:13:49.291
I know this is a very short,

00:13:49.451 --> 00:13:51.071
video for such a broad topic,

00:13:51.071 --> 00:13:51.391
but,

00:13:51.911 --> 00:13:52.311
this,

00:13:52.391 --> 00:13:52.991
all of these,

00:13:52.991 --> 00:13:53.271
like,

00:13:53.271 --> 00:13:55.271
tests in this complete repo is going to be

00:13:55.271 --> 00:13:55.591
available,

00:13:56.261 --> 00:13:56.981
for you guys.

00:13:56.981 --> 00:13:59.701
So you can basically go take a look at all of this

00:13:59.701 --> 00:14:00.021
code,

00:14:00.021 --> 00:14:00.581
and then,

00:14:00.901 --> 00:14:01.621
you can pull it down,

00:14:01.621 --> 00:14:02.861
copy it into your code base,

00:14:02.861 --> 00:14:03.381
and then you can,

00:14:03.381 --> 00:14:03.701
like,

00:14:03.701 --> 00:14:04.821
extend these test cases.

00:14:05.121 --> 00:14:05.681
You really want to,

00:14:05.681 --> 00:14:05.801
like,

00:14:05.801 --> 00:14:06.181
practice,

00:14:06.181 --> 00:14:06.641
testing,

00:14:06.641 --> 00:14:07.441
or if you want to,

00:14:07.441 --> 00:14:07.601
like,

00:14:07.601 --> 00:14:09.241
make changes or kind of make these even better,

00:14:09.241 --> 00:14:10.041
that's totally fine.

00:14:10.041 --> 00:14:10.801
I would just say,

00:14:11.291 --> 00:14:11.811
think about,

00:14:11.811 --> 00:14:12.051
like,

00:14:12.051 --> 00:14:13.131
when you write your code,

00:14:13.211 --> 00:14:15.091
write how you can write your code to make it

00:14:15.091 --> 00:14:15.691
really testable.

00:14:15.691 --> 00:14:16.251
Make it test,

00:14:16.251 --> 00:14:16.571
like,

00:14:16.571 --> 00:14:18.011
be able to test really easily.

00:14:18.011 --> 00:14:20.171
Make sure you don't have tons and tons of,

00:14:20.171 --> 00:14:20.291
like,

00:14:20.291 --> 00:14:22.171
embedded functions inside of embedded functions

00:14:22.171 --> 00:14:23.851
that are doing a whole bunch of stuff where it's

00:14:23.851 --> 00:14:23.931
like,

00:14:23.931 --> 00:14:24.091
oh,

00:14:24.091 --> 00:14:25.051
how do I even test this?

00:14:25.531 --> 00:14:25.631
I,

00:14:25.671 --> 00:14:27.431
do think testing durable objects is hard.

00:14:27.431 --> 00:14:28.071
As you can see,

00:14:28.071 --> 00:14:28.391
this is,

00:14:28.391 --> 00:14:28.591
like,

00:14:28.591 --> 00:14:30.271
a pretty convoluted test case.

00:14:31.681 --> 00:14:32.841
So what you could do is you could see,

00:14:32.841 --> 00:14:33.041
like,

00:14:33.041 --> 00:14:35.121
is there any way that I can refactor our durable

00:14:35.121 --> 00:14:36.721
object to make it a little bit more testable?

00:14:36.721 --> 00:14:37.241
That's kind of like,

00:14:37.241 --> 00:14:39.001
one mindset that you could go into to try to,

00:14:39.001 --> 00:14:39.281
like,

00:14:39.281 --> 00:14:40.481
refine this a little bit.

00:14:41.201 --> 00:14:43.001
But I would definitely use this as a starting

00:14:43.001 --> 00:14:43.281
point.

00:14:43.281 --> 00:14:44.481
So as you build,

00:14:44.761 --> 00:14:46.921
more complicated things on top of Cloudflare,

00:14:47.241 --> 00:14:47.921
you can also,

00:14:47.921 --> 00:14:48.201
like,

00:14:48.201 --> 00:14:49.441
kind of use this as a framework for,

00:14:49.441 --> 00:14:49.641
oh,

00:14:49.641 --> 00:14:51.321
here's my mental model for how I'm going to test

00:14:51.321 --> 00:14:51.641
things.

