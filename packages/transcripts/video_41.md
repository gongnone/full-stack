WEBVTT
X-TIMESTAMP-MAP=LOCAL:00:00:00.000,MPEGTS:900000

00:00:00.028 --> 00:00:00.348
All right,

00:00:00.348 --> 00:00:01.628
to start off this build,

00:00:01.708 --> 00:00:04.108
let's head over to our data service application,

00:00:04.268 --> 00:00:06.828
go into source and we're going to be creating a

00:00:07.388 --> 00:00:08.988
new durable object.

00:00:09.228 --> 00:00:10.508
We can call this guy

00:00:11.388 --> 00:00:11.868
Link

00:00:12.347 --> 00:00:12.908
Click

00:00:14.108 --> 00:00:15.708
Tracker TS

00:00:15.838 --> 00:00:18.838
and essentially what we're going to want to do is

00:00:18.838 --> 00:00:20.238
we're going to want to just like before,

00:00:20.318 --> 00:00:21.438
we're going to import

00:00:21.758 --> 00:00:23.110
the durable object,

00:00:23.310 --> 00:00:24.590
probably import moment.

00:00:24.590 --> 00:00:26.070
We're not going to use it right away,

00:00:26.070 --> 00:00:27.350
but we will be using it.

00:00:27.350 --> 00:00:30.190
And then I'm going to create a base class

00:00:30.590 --> 00:00:32.990
called Link click Tracker.

00:00:34.190 --> 00:00:34.590
Now

00:00:35.570 --> 00:00:36.850
as we did before,

00:00:37.490 --> 00:00:41.090
we're going to set up a  and that  is going to

00:00:41.570 --> 00:00:42.450
pass in super.

00:00:42.530 --> 00:00:43.890
It's going to take our context.

00:00:43.890 --> 00:00:45.730
So this durable object context with the state,

00:00:45.810 --> 00:00:47.370
the emv pass it in the super.

00:00:47.370 --> 00:00:47.770
Okay,

00:00:47.770 --> 00:00:48.770
so now we have a

00:00:49.410 --> 00:00:50.290
base class here.

00:00:50.610 --> 00:00:52.610
Now the very first thing that we're going to focus

00:00:52.610 --> 00:00:55.010
on before we get into websockets is we're going to

00:00:55.010 --> 00:00:58.130
be getting the actual like link click data into a

00:00:58.130 --> 00:00:59.250
SQLite table.

00:00:59.650 --> 00:01:01.090
And the SQLite table,

00:01:01.170 --> 00:01:03.550
is just going to literally be like a sorted table

00:01:03.550 --> 00:01:05.870
that's kind of partitioned on the click time.

00:01:06.510 --> 00:01:08.510
So what we can do here is if you,

00:01:08.670 --> 00:01:10.510
if we come into context

00:01:10.990 --> 00:01:12.270
there is a storage

00:01:13.870 --> 00:01:16.750
and then storage does have a SQL property.

00:01:16.750 --> 00:01:18.990
Now just to kind of make this a little bit easier

00:01:18.990 --> 00:01:19.310
because

00:01:20.190 --> 00:01:21.950
we're going to be accessing it quite often.

00:01:22.270 --> 00:01:24.830
What I like to do is I like to define a

00:01:25.290 --> 00:01:27.510
Basically I like to pull out the SQL,

00:01:27.670 --> 00:01:29.030
the specific SQL,

00:01:29.130 --> 00:01:30.010
Storage API,

00:01:30.250 --> 00:01:32.930
define it at the top level of the class and is of

00:01:32.930 --> 00:01:34.970
the type SQL storage which is coming from the

00:01:34.970 --> 00:01:37.370
durable object Cloudflare workers library

00:01:37.830 --> 00:01:39.670
and then you can just simply say

00:01:40.230 --> 00:01:41.510
this dot SQL.

00:01:41.510 --> 00:01:43.750
So this is during startup equal CTX

00:01:44.230 --> 00:01:44.950
storage

00:01:45.350 --> 00:01:45.690
dot

00:01:45.690 --> 00:01:46.090
SQL.

00:01:46.970 --> 00:01:48.970
So this will just make it easier to access later.

00:01:49.850 --> 00:01:50.410
All right,

00:01:50.410 --> 00:01:50.810
so

00:01:51.210 --> 00:01:51.610
what,

00:01:51.930 --> 00:01:54.570
what I typically like to do very very first when

00:01:55.300 --> 00:01:58.980
building out a durable object that utilizes the

00:01:59.350 --> 00:02:00.480
SQLite API

00:02:00.959 --> 00:02:03.120
is I like to define the table

00:02:03.680 --> 00:02:04.680
at startup.

00:02:04.680 --> 00:02:06.960
So basically within this  now,

00:02:07.270 --> 00:02:09.030
if you notice when we say

00:02:09.350 --> 00:02:10.110
this.

00:02:10.110 --> 00:02:10.630
SQL,

00:02:10.790 --> 00:02:11.830
we're going to have

00:02:12.550 --> 00:02:15.510
an executable which basically allows us to execute

00:02:15.510 --> 00:02:16.870
a specific SQL query.

00:02:17.190 --> 00:02:18.990
So the first thing that we're going to do is we're

00:02:18.990 --> 00:02:21.590
going to create a table if it does not exist.

00:02:21.850 --> 00:02:23.290
so this is what this would look like.

00:02:23.290 --> 00:02:24.550
We would basically just say

00:02:25.404 --> 00:02:25.804
this

00:02:26.124 --> 00:02:26.684
dot.

00:02:26.844 --> 00:02:28.444
So what we say is this

00:02:28.534 --> 00:02:32.084
this dot execute is going to create a table if not

00:02:32.084 --> 00:02:32.564
exists.

00:02:32.564 --> 00:02:33.644
And we're going to call this

00:02:33.964 --> 00:02:35.204
Geolink clicks.

00:02:35.204 --> 00:02:36.804
This is going to take latitude,

00:02:36.804 --> 00:02:37.539
longitude,

00:02:37.539 --> 00:02:38.064
command country

00:02:38.464 --> 00:02:39.184
and time.

00:02:39.264 --> 00:02:40.064
So it's very,

00:02:40.304 --> 00:02:40.784
you know,

00:02:40.784 --> 00:02:42.704
there's not a lot of features of this

00:02:42.794 --> 00:02:43.544
specific table.

00:02:43.544 --> 00:02:45.664
It's just going to specifically capture these link

00:02:45.664 --> 00:02:46.416
clicks for us.

00:02:46.492 --> 00:02:47.612
Now because this,

00:02:47.692 --> 00:02:51.292
this durable object is going to have methods that

00:02:51.292 --> 00:02:53.132
ultimately query this table.

00:02:53.532 --> 00:02:55.612
What we're going to want to make sure we do is

00:02:55.612 --> 00:02:56.652
we're going to want to

00:02:57.132 --> 00:02:59.932
do this operation where we create the table if it

00:02:59.932 --> 00:03:00.652
does not exist

00:03:01.052 --> 00:03:02.412
inside of the

00:03:02.982 --> 00:03:04.102
block concurrency while.

00:03:04.102 --> 00:03:04.902
And the reason we,

00:03:04.902 --> 00:03:06.262
why we want to do this is because

00:03:06.582 --> 00:03:09.142
if we spin up a durable object and then another

00:03:09.822 --> 00:03:12.862
function that's running somewhere in our code also

00:03:13.262 --> 00:03:15.702
creates the same durable object instance and then

00:03:15.702 --> 00:03:17.902
calls a method like query database

00:03:18.221 --> 00:03:19.822
and that table doesn't exist yet,

00:03:19.822 --> 00:03:20.982
it's going to throw an error.

00:03:20.982 --> 00:03:23.902
So in order to block that from happening,

00:03:23.902 --> 00:03:25.822
what we're going to do is inside of this

00:03:26.572 --> 00:03:29.172
block concurrent while method we're just going to

00:03:29.172 --> 00:03:30.512
run that SQL object

00:03:30.862 --> 00:03:31.422
execute

00:03:31.802 --> 00:03:32.222
query.

00:03:32.222 --> 00:03:34.662
So this basically says the first time the table

00:03:34.662 --> 00:03:35.662
was ever created,

00:03:35.662 --> 00:03:37.542
this or the first time this durable object

00:03:37.542 --> 00:03:38.702
instance is created,

00:03:38.862 --> 00:03:40.462
this table will also be created.

00:03:40.462 --> 00:03:42.942
And then the next time this durable object

00:03:42.942 --> 00:03:44.288
instance is instantiated

00:03:44.288 --> 00:03:46.274
this is basically not going to do anything just

00:03:46.274 --> 00:03:48.228
because it will already have been created.

00:03:48.228 --> 00:03:50.217
Now the next thing we're going to want to do is

00:03:50.217 --> 00:03:51.937
just define a simple

00:03:52.217 --> 00:03:53.677
method that we'll extend later

00:03:53.997 --> 00:03:55.427
call called Add Link click.

00:03:55.587 --> 00:03:57.427
And all that this is going to do is it's going to

00:03:57.427 --> 00:03:59.347
take in the information that we want to add,

00:03:59.777 --> 00:04:03.177
that we want to add into the database and then

00:04:03.177 --> 00:04:04.977
we'll just literally insert a

00:04:05.667 --> 00:04:06.947
insert into query.

00:04:06.947 --> 00:04:07.347
Now

00:04:07.667 --> 00:04:09.747
best practice would be to kind of abstract

00:04:10.147 --> 00:04:12.387
these types of queries to,

00:04:12.947 --> 00:04:13.427
you know,

00:04:13.427 --> 00:04:14.787
like either an orm

00:04:15.267 --> 00:04:17.827
or maybe into other files or methods.

00:04:18.317 --> 00:04:18.622
but,

00:04:18.720 --> 00:04:19.840
but for the purpose of time,

00:04:19.920 --> 00:04:22.360
I just don't want to like get too distracted with

00:04:22.360 --> 00:04:24.280
a whole bunch of different dependencies because I

00:04:24.280 --> 00:04:26.120
know this is a section where some people might get

00:04:26.120 --> 00:04:27.920
lost and that's totally okay because this is a

00:04:27.920 --> 00:04:28.880
pretty advanced topic.

00:04:29.190 --> 00:04:30.800
one thing that you're going to know is we have

00:04:30.800 --> 00:04:31.840
these question marks.

00:04:31.840 --> 00:04:32.720
Now this

00:04:33.840 --> 00:04:37.400
this execute method takes in a query and then it

00:04:37.400 --> 00:04:39.640
takes in bindings and these bindings.

00:04:39.640 --> 00:04:42.080
Basically what it means is it's not like the same

00:04:42.080 --> 00:04:43.280
as your Cloudflare bindings.

00:04:43.280 --> 00:04:44.960
These bindings are ultimately just

00:04:45.712 --> 00:04:47.312
values that will be inserted in,

00:04:47.392 --> 00:04:48.792
in the order that they're defined.

00:04:48.792 --> 00:04:50.032
So latitude will be here,

00:04:50.512 --> 00:04:51.392
longitude,

00:04:51.472 --> 00:04:51.872
country,

00:04:52.432 --> 00:04:52.792
time.

00:04:52.792 --> 00:04:55.152
And this essentially just makes it so people can't

00:04:55.152 --> 00:04:56.672
like try to inject,

00:04:57.402 --> 00:05:00.042
inject dangerous SQL code into this query.

00:05:00.042 --> 00:05:02.202
Like you could imagine a user could basically type

00:05:02.202 --> 00:05:02.842
out like a,

00:05:03.602 --> 00:05:05.962
show me all tables or select all from some table

00:05:05.962 --> 00:05:08.002
and then they could stuff it inside of an inner,

00:05:08.002 --> 00:05:10.962
inner query and it could be pushed into a,

00:05:11.342 --> 00:05:12.982
it could be pushed into your SQL query and then

00:05:12.982 --> 00:05:14.782
all of a sudden like malicious code is running on

00:05:14.782 --> 00:05:15.182
your machine.

00:05:15.182 --> 00:05:17.022
So this just kind of prevents that from happening

00:05:17.022 --> 00:05:17.342
and

00:05:17.722 --> 00:05:20.522
just like a really safe way of managing your

00:05:20.842 --> 00:05:21.322
queries.

00:05:21.322 --> 00:05:21.812
They're called

00:05:22.292 --> 00:05:22.932
bindings.

00:05:22.979 --> 00:05:25.498
Now while we're talking about bindings and talking

00:05:25.498 --> 00:05:27.979
about ORMs and trying to find ways of making this

00:05:27.979 --> 00:05:28.899
a little bit cleaner,

00:05:29.139 --> 00:05:32.579
Drizzle does have some documentation about how to

00:05:32.579 --> 00:05:36.139
configure a durable object to basically utilize

00:05:36.139 --> 00:05:37.369
Drizzle directly.

00:05:37.369 --> 00:05:38.739
and then you're able to like

00:05:39.369 --> 00:05:41.289
migrate your table so you can kind of abstract

00:05:41.289 --> 00:05:43.449
away the like creation of the tables.

00:05:43.449 --> 00:05:46.409
And then also you can use Drizzle to like insert

00:05:46.409 --> 00:05:47.415
data into the table.

00:05:47.581 --> 00:05:49.101
I have played around with this.

00:05:49.241 --> 00:05:50.261
it works pretty well.

00:05:50.261 --> 00:05:52.821
Although I did have a lot of issues trying to get

00:05:52.821 --> 00:05:54.661
like the dynamic table migration.

00:05:54.661 --> 00:05:57.421
So like the creation of those tables to be done

00:05:57.421 --> 00:05:58.301
via Drizzle,

00:05:58.301 --> 00:06:00.361
I played around with it for a few hours and I

00:06:00.361 --> 00:06:02.481
ultimately just decided for like a use case like

00:06:02.481 --> 00:06:02.721
this.

00:06:02.721 --> 00:06:04.441
I'm okay writing this raw

00:06:04.851 --> 00:06:05.451
SQL stuff,

00:06:05.451 --> 00:06:07.011
but if I were to build a really,

00:06:07.011 --> 00:06:07.291
really,

00:06:07.291 --> 00:06:07.611
really,

00:06:07.611 --> 00:06:09.731
really advanced use case on top of the

00:06:10.141 --> 00:06:12.991
on top of durable objects with their SQL API,

00:06:13.151 --> 00:06:15.311
I would probably bring in another orm.

00:06:15.311 --> 00:06:16.911
So just keep that in mind and if you're ever doing

00:06:16.911 --> 00:06:17.151
something,

00:06:17.151 --> 00:06:18.871
you can go ahead and look into this because this

00:06:18.871 --> 00:06:20.031
is kind of cool where you can

00:06:20.381 --> 00:06:23.151
define Drizzle on top of your SQLite database that

00:06:23.151 --> 00:06:24.851
is provided by a durable object.

00:06:25.598 --> 00:06:26.158
Okay,

00:06:26.158 --> 00:06:29.278
so now that we have this add link click method,

00:06:29.328 --> 00:06:31.808
that's part of our class that saves the data into

00:06:31.808 --> 00:06:32.528
our table.

00:06:32.848 --> 00:06:33.718
I'm going to def

00:06:34.268 --> 00:06:36.028
a temporary fetch function.

00:06:36.228 --> 00:06:39.098
And all that this is going to do is it is going

00:06:39.098 --> 00:06:39.498
to.

00:06:39.818 --> 00:06:41.258
We can basically say

00:06:41.978 --> 00:06:43.498
it's going to have a request.

00:06:45.765 --> 00:06:47.948
All that is going to do is it defines a query

00:06:47.948 --> 00:06:50.788
where it says select everything from geolink

00:06:50.788 --> 00:06:51.188
clicks,

00:06:51.188 --> 00:06:52.348
limits it by 100.

00:06:52.938 --> 00:06:55.568
it uses this.ah SQL which we've defined at the top

00:06:55.568 --> 00:06:56.208
level here,

00:06:56.448 --> 00:06:58.048
to execute the query.

00:06:58.528 --> 00:07:00.808
Then it takes the cursor and converts those

00:07:00.808 --> 00:07:03.768
results into an array and then it returns those

00:07:03.768 --> 00:07:04.128
results

00:07:04.438 --> 00:07:07.028
in a JSON object or like in a JSON

00:07:07.528 --> 00:07:07.849
type.

00:07:07.849 --> 00:07:09.785
And the reason why I'M defining this here is

00:07:09.785 --> 00:07:12.225
because I want to illustrate how this actually

00:07:12.305 --> 00:07:12.935
works.

00:07:13.045 --> 00:07:13.445
so

00:07:13.765 --> 00:07:15.725
for now what we're going to do is we're also going

00:07:15.725 --> 00:07:17.745
to go back to our Hono API and,

00:07:17.815 --> 00:07:19.255
and we are going to build a

00:07:19.815 --> 00:07:19.835
dummy

00:07:20.155 --> 00:07:23.155
route that interfaces with this specific durable

00:07:23.155 --> 00:07:24.955
object so we can understand how this

00:07:25.865 --> 00:07:27.905
how this SQLite implementation is actually

00:07:27.905 --> 00:07:28.265
working.

00:07:28.653 --> 00:07:30.653
And before we build the Hono,

00:07:31.173 --> 00:07:32.693
before we build our honor route,

00:07:32.693 --> 00:07:34.453
we're going to head over to our

00:07:34.853 --> 00:07:36.293
Wrangler JSON C,

00:07:37.093 --> 00:07:38.453
make sure we have our

00:07:40.233 --> 00:07:40.873
class name

00:07:41.353 --> 00:07:44.233
and then we are going to create another binding in

00:07:44.233 --> 00:07:44.473
here

00:07:46.353 --> 00:07:48.513
and the class name is going to be that.

00:07:48.593 --> 00:07:50.953
And then what we can do is we can create the

00:07:50.953 --> 00:07:51.793
binding name

00:07:52.193 --> 00:07:53.553
which is going to be.

00:07:53.793 --> 00:07:55.233
We'll just call this Link

00:07:55.953 --> 00:07:56.513
click

00:07:57.633 --> 00:07:58.433
Tracker

00:07:59.793 --> 00:08:00.353
object.

00:08:01.473 --> 00:08:03.073
And then I'm also going to,

00:08:03.393 --> 00:08:04.833
inside of the migrations,

00:08:04.833 --> 00:08:06.753
I'm also going to basically say

00:08:07.898 --> 00:08:08.538
V2,

00:08:09.098 --> 00:08:10.698
I'm going to pass in the class name here

00:08:11.468 --> 00:08:14.548
and then we can head over to our index TS inside

00:08:14.548 --> 00:08:15.388
of our data service

00:08:15.948 --> 00:08:18.508
and then similarly we're going to want to export

00:08:18.588 --> 00:08:20.988
that specific class that we just defined,

00:08:27.908 --> 00:08:29.108
Link click tracker.

00:08:29.108 --> 00:08:29.668
Okay.

00:08:30.628 --> 00:08:31.108
Okay.

00:08:31.108 --> 00:08:32.708
So now that we have this

00:08:33.378 --> 00:08:35.498
this class exported in our index ts,

00:08:35.498 --> 00:08:38.178
we've also added the migrations into our

00:08:38.728 --> 00:08:40.248
wrangler JSON C.

00:08:40.248 --> 00:08:41.288
We've added the class.

00:08:41.288 --> 00:08:44.528
What we can do is we can CD into our apps data

00:08:44.528 --> 00:08:44.888
service.

00:08:44.888 --> 00:08:47.288
Make sure we're here pnpm run CF

00:08:47.688 --> 00:08:48.568
type gen

00:08:49.208 --> 00:08:50.608
that's going to this,

00:08:50.608 --> 00:08:52.768
that's going to add this new binding that we have

00:08:52.768 --> 00:08:55.368
access to called Link click tracker object.

00:08:55.808 --> 00:08:57.808
the reason why I gave this the name object is I

00:08:57.808 --> 00:08:59.688
just realized it's a lot easier to kind of like

00:08:59.688 --> 00:09:01.368
see when you're trying to access your bindings.

00:09:01.368 --> 00:09:03.208
I probably should have named this one object as

00:09:03.208 --> 00:09:03.488
well,

00:09:03.488 --> 00:09:05.168
the one that we did in the last section.

00:09:05.648 --> 00:09:08.448
Now what we can do is we can head over to our

00:09:09.193 --> 00:09:11.033
we can head over to our Hono app

00:09:11.913 --> 00:09:15.193
and inside of here I'm going to create a,

00:09:15.353 --> 00:09:16.793
another dummy route

00:09:17.757 --> 00:09:19.597
and we're basically going to say

00:09:20.756 --> 00:09:21.175
click.

00:09:22.202 --> 00:09:23.852
And that's going to take a,

00:09:23.932 --> 00:09:24.972
we'll call this a name

00:09:25.940 --> 00:09:28.370
and for now this is just going to return a C dot,

00:09:28.370 --> 00:09:31.320
JSON and we'll just return an empty JSON object

00:09:31.320 --> 00:09:31.800
for now.

00:09:32.120 --> 00:09:32.680
Okay,

00:09:32.680 --> 00:09:34.200
so now inside of here

00:09:34.760 --> 00:09:35.160
we

00:09:35.480 --> 00:09:38.680
have this section where we go and actually extract

00:09:38.950 --> 00:09:40.576
we send data to our queue.

00:09:40.876 --> 00:09:42.956
Ultimately what happens here is

00:09:43.356 --> 00:09:44.316
in the background,

00:09:44.556 --> 00:09:46.716
as we've kind of mentioned in the last videos,

00:09:46.716 --> 00:09:49.036
we are sending some data over to

00:09:49.876 --> 00:09:50.436
our queue.

00:09:50.436 --> 00:09:52.916
Now what happens here is going to allow for

00:09:52.916 --> 00:09:53.836
asynchronous functions,

00:09:53.836 --> 00:09:55.476
but we don't await inside of here.

00:09:55.886 --> 00:09:58.566
the downside of this is you're only able to stuff

00:09:58.566 --> 00:09:59.766
in one method.

00:09:59.766 --> 00:10:01.966
So basically any logic that happens in here,

00:10:01.966 --> 00:10:03.846
we're going to want to push it out into a single

00:10:03.846 --> 00:10:04.286
method.

00:10:04.686 --> 00:10:07.046
So what we can do is we can head over to Route

00:10:07.046 --> 00:10:07.366
Ops,

00:10:07.366 --> 00:10:09.246
we're going to put a lot of the logic for

00:10:09.826 --> 00:10:11.746
routing the link requests into here.

00:10:11.826 --> 00:10:14.306
So I already coded a lot of this out.

00:10:14.306 --> 00:10:16.266
So basically what we're going to do is we're going

00:10:16.266 --> 00:10:18.266
to take in the environment and that link click

00:10:18.266 --> 00:10:20.566
data that we're defining inside of our app right

00:10:20.566 --> 00:10:20.642
here.

00:10:20.642 --> 00:10:21.202
And then

00:10:22.242 --> 00:10:23.282
we will be

00:10:23.672 --> 00:10:25.992
first sending this data to the queue because it's

00:10:25.992 --> 00:10:27.512
most important to capture that information on the

00:10:27.512 --> 00:10:27.912
queue.

00:10:28.152 --> 00:10:29.432
And then we're going to go and

00:10:29.832 --> 00:10:33.192
get our durable object ID based upon the user's

00:10:33.192 --> 00:10:34.152
account ID

00:10:34.472 --> 00:10:37.112
or the account ID for that specific link.

00:10:37.432 --> 00:10:39.872
And then we're going to grab the stub based upon

00:10:39.872 --> 00:10:42.352
the durable object id and then we're going to just

00:10:42.352 --> 00:10:43.112
make sure that

00:10:43.242 --> 00:10:44.392
we have all the data that we need.

00:10:44.392 --> 00:10:46.872
Because when we are getting this request from,

00:10:47.482 --> 00:10:48.992
the Cloudflare headers,

00:10:49.622 --> 00:10:50.062
latitude,

00:10:50.062 --> 00:10:51.782
longitude and country are like

00:10:52.352 --> 00:10:53.492
possibly undefined.

00:10:53.572 --> 00:10:55.692
So we make sure we have all the data that we need

00:10:55.692 --> 00:10:56.772
for link tracking,

00:10:56.772 --> 00:10:59.052
from like a GEO data perspective.

00:10:59.292 --> 00:10:59.932
And if not,

00:10:59.932 --> 00:11:02.172
we return and if we do have this stuff,

00:11:02.172 --> 00:11:04.372
then we're just taking our stub and we're passing

00:11:04.372 --> 00:11:06.052
that data into Add Click,

00:11:06.052 --> 00:11:07.852
which is the method that we defined

00:11:07.947 --> 00:11:08.747
right here

00:11:09.067 --> 00:11:11.307
and it's inserting that data into our table.

00:11:11.467 --> 00:11:13.867
So this is how we're going to wire it into our

00:11:13.867 --> 00:11:14.187
system.

00:11:14.267 --> 00:11:16.027
Now I'm just going to make sure we can copy this

00:11:16.027 --> 00:11:16.427
guy

00:11:17.077 --> 00:11:19.637
and I'm going to replace this with that,

00:11:19.797 --> 00:11:21.397
make sure it's imported.

00:11:21.397 --> 00:11:24.517
We can say C EMV and then we'll also pass in the

00:11:24.517 --> 00:11:25.317
queue message.

00:11:25.717 --> 00:11:26.237
Okay,

00:11:26.237 --> 00:11:27.677
so this is going to be doing the same thing where

00:11:27.677 --> 00:11:28.877
it's sending the data to our queue,

00:11:28.877 --> 00:11:30.917
but it's also calling that durable object.

00:11:31.237 --> 00:11:32.437
Now that we have that done,

00:11:32.516 --> 00:11:34.677
let's head back over to this dummy,

00:11:34.947 --> 00:11:36.097
this dummy route that we're.

00:11:36.977 --> 00:11:38.817
We'll just call this click link

00:11:39.137 --> 00:11:39.697
click.

00:11:39.716 --> 00:11:42.090
And this is actually going to take an account id.

00:11:43.240 --> 00:11:44.170
I'm just going to go.

00:11:44.650 --> 00:11:46.250
So we can basically say

00:11:46.890 --> 00:11:47.290
const.

00:11:53.305 --> 00:11:56.585
We're going to pull our account ID from the param.

00:11:56.985 --> 00:11:59.265
And then similarly what we're going to want to do

00:11:59.265 --> 00:12:02.585
is we're going to want to go to our

00:12:03.335 --> 00:12:04.055
link click tracker.

00:12:04.055 --> 00:12:05.895
And you notice that we have this fetch handler.

00:12:05.895 --> 00:12:08.375
This fetch handler is built in to the durable

00:12:08.375 --> 00:12:10.135
object API and we're just implementing,

00:12:10.295 --> 00:12:11.255
getting a request,

00:12:11.255 --> 00:12:12.375
executing our query,

00:12:12.615 --> 00:12:13.575
pulling that data.

00:12:13.655 --> 00:12:15.895
So all we actually have to do here is

00:12:16.759 --> 00:12:18.999
similar to how we got our stub before,

00:12:19.319 --> 00:12:20.679
we're going to take the

00:12:20.999 --> 00:12:21.799
account id,

00:12:21.959 --> 00:12:23.359
we're going to pass that into here.

00:12:23.359 --> 00:12:25.559
So we're going to get a unique durable object ID

00:12:25.799 --> 00:12:27.979
based upon our unique duration account id

00:12:28.459 --> 00:12:31.339
and then we are going to get the stub

00:12:31.819 --> 00:12:35.419
and then the stub has a fetch handler and all that

00:12:35.419 --> 00:12:36.459
we need to return

00:12:36.779 --> 00:12:37.419
from a

00:12:37.679 --> 00:12:38.459
API route

00:12:38.859 --> 00:12:40.899
perspective is actually that fetch handler.

00:12:40.899 --> 00:12:42.299
So we can say

00:12:42.619 --> 00:12:44.096
we can basically come here and say

00:12:44.656 --> 00:12:45.176
wait,

00:12:45.176 --> 00:12:46.416
stub dot fetch

00:12:47.376 --> 00:12:48.976
and we can pass in C dot

00:12:50.096 --> 00:12:50.656
request

00:12:51.706 --> 00:12:52.655
dot raw

00:12:53.182 --> 00:12:55.342
and from here we're able to actually proxy that

00:12:55.662 --> 00:12:56.302
specific

00:12:56.432 --> 00:12:56.682
this,

00:12:57.162 --> 00:12:59.242
this request to our durable object.

00:12:59.242 --> 00:13:01.042
So we're just forwarding that request to a

00:13:01.042 --> 00:13:03.922
specific instance of our durable object and we are

00:13:03.922 --> 00:13:05.481
having our durable object take

00:13:05.952 --> 00:13:07.022
control of that

00:13:07.342 --> 00:13:08.014
response.

00:13:08.015 --> 00:13:08.358
All right,

00:13:08.358 --> 00:13:09.798
now before we deploy,

00:13:09.878 --> 00:13:13.038
one thing that I'm noticing here is I have a typo.

00:13:13.038 --> 00:13:16.438
I'm adding order by id but we actually don't have

00:13:16.438 --> 00:13:16.758
ID

00:13:17.108 --> 00:13:19.398
in this table so we don't want to do that.

00:13:20.148 --> 00:13:21.138
make sure we save that.

00:13:21.138 --> 00:13:22.458
And then another thing

00:13:22.668 --> 00:13:24.698
that I was just kind of scanning before deploying

00:13:24.698 --> 00:13:25.098
is

00:13:25.818 --> 00:13:28.218
you notice right here we have classes,

00:13:28.668 --> 00:13:29.068
but

00:13:29.548 --> 00:13:32.348
technically this is a SQLite backed class.

00:13:32.748 --> 00:13:33.148
So

00:13:34.016 --> 00:13:36.816
what we're going to want to do is make sure we say

00:13:36.976 --> 00:13:40.336
new SQLite classes for our link tracker.

00:13:40.886 --> 00:13:42.316
from there we should be able to deploy.

00:13:46.651 --> 00:13:50.011
And while this is deploying I'm just going to head

00:13:50.011 --> 00:13:52.091
over to our SQL D1.

00:13:52.173 --> 00:13:53.510
I'm going to go to explore data

00:13:53.830 --> 00:13:56.470
and then I'm going to say select star from

00:13:57.270 --> 00:13:58.390
link clicks

00:13:59.110 --> 00:13:59.510
order.

00:14:00.310 --> 00:14:01.830
Let's just make sure we can see what,

00:14:01.830 --> 00:14:02.470
what's there.

00:14:02.790 --> 00:14:03.270
Let's

00:14:03.670 --> 00:14:04.070
order

00:14:04.390 --> 00:14:04.790
by

00:14:06.500 --> 00:14:07.260
what do we got?

00:14:07.260 --> 00:14:07.620
Time.

00:14:07.860 --> 00:14:08.580
Click time.

00:14:10.100 --> 00:14:10.860
Descending.

00:14:10.860 --> 00:14:12.820
I just want to make sure we get the right account

00:14:12.900 --> 00:14:13.580
ID here.

00:14:13.580 --> 00:14:14.144
So it's 1,

00:14:14.180 --> 00:14:14.326
2,

00:14:14.362 --> 00:14:14.508
3,

00:14:14.544 --> 00:14:14.690
4,

00:14:14.727 --> 00:14:14.872
5,

00:14:14.909 --> 00:14:15.055
6,

00:14:15.091 --> 00:14:15.237
7,

00:14:15.273 --> 00:14:15.419
8,

00:14:15.456 --> 00:14:15.620
9.

00:14:16.460 --> 00:14:16.860
now

00:14:17.500 --> 00:14:18.540
you can grab your

00:14:19.230 --> 00:14:20.640
deployable URL right here

00:14:21.200 --> 00:14:23.440
and I'm just gonna go ahead and load that.

00:14:23.440 --> 00:14:25.840
And what we're gonna notice is we get an array

00:14:25.840 --> 00:14:28.230
with no values inside of it.

00:14:28.230 --> 00:14:29.580
and that's kind of by design because

00:14:30.220 --> 00:14:32.900
we haven't actually triggered this logic where we

00:14:32.900 --> 00:14:33.260
add

00:14:33.990 --> 00:14:35.360
where we insert data into

00:14:35.760 --> 00:14:36.560
the table.

00:14:36.720 --> 00:14:37.120
So

00:14:37.410 --> 00:14:38.650
when we call this fetch handler,

00:14:38.650 --> 00:14:41.450
when we procs it via our hono request we're not

00:14:41.450 --> 00:14:42.130
getting any data.

00:14:42.830 --> 00:14:45.070
But what we can do is we can head over to

00:14:45.980 --> 00:14:47.340
I think I just have some

00:14:48.320 --> 00:14:48.720
service.

00:14:48.880 --> 00:14:51.360
So this is going to do our redirect for us,

00:14:51.440 --> 00:14:52.320
go to Google.

00:14:52.320 --> 00:14:55.080
And then now when I hit this guy I do expect to

00:14:55.080 --> 00:14:55.760
have data in here.

00:14:55.760 --> 00:14:57.640
So notice we get some data in here.

00:14:57.640 --> 00:14:58.560
I'm going to do that again

00:14:59.680 --> 00:15:01.600
and we're going to come over here

00:15:01.864 --> 00:15:04.057
and load this guy and we have even more data.

00:15:04.057 --> 00:15:05.177
I'll even pretty that.

00:15:05.177 --> 00:15:05.577
So

00:15:05.997 --> 00:15:08.357
essentially this is pulling the data that is

00:15:08.357 --> 00:15:11.037
inside of our SQLite table right here.

00:15:11.037 --> 00:15:13.017
Now if we go to a different light like we change

00:15:13.017 --> 00:15:13.657
this right here,

00:15:13.817 --> 00:15:14.417
there's going,

00:15:14.417 --> 00:15:16.537
we're not going to have any data inside of that.

00:15:16.617 --> 00:15:17.017
So

00:15:17.697 --> 00:15:19.217
just to kind of recap what's happening,

00:15:19.217 --> 00:15:19.857
we have

00:15:20.417 --> 00:15:20.817
our,

00:15:21.537 --> 00:15:22.497
we have our

00:15:22.837 --> 00:15:23.867
link click up here

00:15:24.347 --> 00:15:25.867
that is going to hono.

00:15:25.867 --> 00:15:27.867
It's figuring out where it should redirect to

00:15:27.867 --> 00:15:28.987
Redirect in the background.

00:15:28.987 --> 00:15:31.227
It's sending some data to a queue and it's also

00:15:31.307 --> 00:15:34.067
adding that link to a durable object at the level

00:15:34.067 --> 00:15:34.747
of the account.

00:15:34.827 --> 00:15:35.867
So every single account

00:15:36.667 --> 00:15:37.667
contains his own link.

00:15:37.667 --> 00:15:38.187
Click data.

00:15:38.247 --> 00:15:40.107
so if you have another person that signs up,

00:15:40.487 --> 00:15:42.087
they'll have a different account and then that

00:15:42.087 --> 00:15:44.287
data will be isolated based upon durable objects.

00:15:44.287 --> 00:15:45.687
So this is all abstracted away

00:15:46.007 --> 00:15:47.927
in one function right here.

00:15:48.247 --> 00:15:50.247
Call capture link clicks and background.

00:15:50.567 --> 00:15:51.767
And then in our

00:15:52.027 --> 00:15:53.327
in our Hono app right here,

00:15:53.327 --> 00:15:54.527
we are able to

00:15:55.827 --> 00:15:57.027
that data into the background.

00:15:57.587 --> 00:15:57.987
This

00:15:58.387 --> 00:15:59.907
and then we have a dummy

00:16:00.267 --> 00:16:01.067
route right here.

00:16:01.067 --> 00:16:03.587
Link click where we pass in that account ID and

00:16:03.587 --> 00:16:05.347
we're getting a durable object based upon an

00:16:05.347 --> 00:16:07.227
account ID and we're passing the request

00:16:07.777 --> 00:16:10.257
directly through into our durable object,

00:16:10.417 --> 00:16:11.777
just kind of proxying that,

00:16:11.777 --> 00:16:12.657
selecting everything,

00:16:12.737 --> 00:16:15.457
limiting 100 and then we're returning that data.

00:16:15.617 --> 00:16:17.697
Now this actually doesn't matter.

00:16:17.697 --> 00:16:18.657
We don't need this

00:16:18.977 --> 00:16:20.577
and we don't need

00:16:21.887 --> 00:16:22.277
this,

00:16:22.947 --> 00:16:23.757
route as well.

00:16:23.997 --> 00:16:25.997
But just for the purpose of like understanding how

00:16:25.997 --> 00:16:26.357
this works,

00:16:26.357 --> 00:16:27.477
that's why I added it here.

00:16:27.477 --> 00:16:28.317
So I'm going to keep it in.

00:16:28.317 --> 00:16:28.707
I'm going to

00:16:28.907 --> 00:16:30.467
you'll be able to kind of copy this over and play

00:16:30.467 --> 00:16:30.987
around with it.

00:16:30.987 --> 00:16:32.907
But in the next video we're going to be deleting

00:16:32.907 --> 00:16:34.227
this stuff and we're going to actually start

00:16:34.227 --> 00:16:36.208
building out more of the sophisticated features.

