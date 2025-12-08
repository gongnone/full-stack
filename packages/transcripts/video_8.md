WEBVTT
X-TIMESTAMP-MAP=LOCAL:00:00:00.000,MPEGTS:900000

00:00:00.290 --> 00:00:00.810
All right,

00:00:00.810 --> 00:00:02.450
so let's actually start building out the data

00:00:02.450 --> 00:00:04.450
layer of our application now.

00:00:04.450 --> 00:00:05.090
Like promised,

00:00:05.090 --> 00:00:07.370
we're going to be using the built in D1 database

00:00:07.370 --> 00:00:08.570
as part of Cloudflare's offering.

00:00:08.570 --> 00:00:10.090
It's really great for this project because we

00:00:10.090 --> 00:00:11.500
don't have to jump to different providers.

00:00:11.500 --> 00:00:12.670
but if you are building a really,

00:00:12.670 --> 00:00:14.350
really serious project that's going to have good

00:00:14.350 --> 00:00:16.150
scale and you're building it like for a client or

00:00:16.150 --> 00:00:16.430
something,

00:00:16.510 --> 00:00:18.350
I wouldn't necessarily recommend this

00:00:18.990 --> 00:00:20.190
with a few different caveats.

00:00:20.270 --> 00:00:20.670
Now

00:00:21.310 --> 00:00:24.030
I think that the D1 database is insane for side

00:00:24.030 --> 00:00:24.470
projects,

00:00:24.470 --> 00:00:26.350
it's insane for smaller projects or even some mid

00:00:26.350 --> 00:00:26.990
sized projects.

00:00:26.990 --> 00:00:27.630
But there's a few

00:00:28.010 --> 00:00:29.530
caveats that you have to pay attention to.

00:00:29.810 --> 00:00:32.530
in terms of like the number of rows you can read,

00:00:32.930 --> 00:00:34.970
they have very generous like offerings.

00:00:34.970 --> 00:00:37.730
So like as part of their $5 a month workers pay

00:00:37.730 --> 00:00:39.570
tier you get 25 billion

00:00:39.970 --> 00:00:42.050
reads and then you pay per usage after that and

00:00:42.050 --> 00:00:42.970
it's the same thing for rights.

00:00:42.970 --> 00:00:45.010
50 million rides and you pay for usage after that.

00:00:45.010 --> 00:00:45.810
Like if you have

00:00:46.130 --> 00:00:47.035
this much usage

00:00:47.035 --> 00:00:47.729
on D1,

00:00:47.729 --> 00:00:48.369
that's crazy.

00:00:48.369 --> 00:00:50.329
Like I haven't really seen side projects hit this.

00:00:50.329 --> 00:00:52.729
I mean I guess it's possible but this is like,

00:00:52.729 --> 00:00:53.089
you know,

00:00:53.089 --> 00:00:54.689
you're building a pretty serious application at

00:00:54.689 --> 00:00:56.489
this point and then I would say probably pick a

00:00:56.489 --> 00:00:57.449
different database provider.

00:00:57.449 --> 00:00:58.329
So if you're under these

00:00:58.709 --> 00:00:59.709
thresholds like go ahead,

00:00:59.709 --> 00:01:00.309
use D1,

00:01:00.309 --> 00:01:01.429
you're going to have a great time.

00:01:01.469 --> 00:01:03.069
the main limitation here is

00:01:03.549 --> 00:01:05.829
the database size which is 10 gigabytes.

00:01:05.829 --> 00:01:06.189
Now

00:01:06.819 --> 00:01:08.539
most side projects you probably don't have to

00:01:08.539 --> 00:01:10.979
worry about hitting that 10 gigabyte limit per

00:01:10.979 --> 00:01:12.019
database instance.

00:01:12.099 --> 00:01:12.499
But

00:01:12.999 --> 00:01:14.979
there are more data intensive applications where

00:01:14.979 --> 00:01:16.299
this is going to become an issue.

00:01:16.459 --> 00:01:18.779
And that's kind of like where things get really

00:01:18.779 --> 00:01:19.099
tricky.

00:01:19.099 --> 00:01:20.019
With D1 database,

00:01:20.019 --> 00:01:21.219
I've heard a lot of people say,

00:01:21.219 --> 00:01:23.659
well I'm not worried about that limit because

00:01:23.659 --> 00:01:25.459
essentially what I'll do is I'll do like a multi

00:01:25.459 --> 00:01:26.269
tenant setup,

00:01:26.419 --> 00:01:28.979
meaning each user gets their own database.

00:01:28.979 --> 00:01:31.699
And I think there's a company called Torso which

00:01:31.699 --> 00:01:32.659
kind of pioneered

00:01:32.979 --> 00:01:33.739
this at like

00:01:34.719 --> 00:01:35.259
at a

00:01:35.259 --> 00:01:37.379
kind of a more enterprise level or like serious

00:01:37.379 --> 00:01:37.699
service.

00:01:37.699 --> 00:01:39.259
But essentially like they're like,

00:01:39.259 --> 00:01:39.459
yeah,

00:01:39.459 --> 00:01:40.259
you can kind of spin up

00:01:40.288 --> 00:01:42.369
database instance per user.

00:01:42.579 --> 00:01:44.139
now that's totally fine and dandy,

00:01:44.139 --> 00:01:44.899
you can go that route.

00:01:44.899 --> 00:01:47.299
But I do think that setup is very complicated and

00:01:47.699 --> 00:01:49.739
one of the main issues is when you're connecting

00:01:49.739 --> 00:01:52.019
to your D1 database via Cloudflare worker You need

00:01:52.019 --> 00:01:53.939
to specify that in your Wrangler configuration.

00:01:54.019 --> 00:01:56.439
So if you got a new user and you want to bring in

00:01:56.439 --> 00:01:57.279
a new database,

00:01:57.599 --> 00:02:00.759
you would have to redeploy or deploy your project

00:02:00.759 --> 00:02:02.639
as a new worker for them.

00:02:02.719 --> 00:02:03.799
And I just,

00:02:03.799 --> 00:02:05.879
I just don't know really how you scale that within

00:02:05.879 --> 00:02:07.839
like the Cloudflare worker ecosystem.

00:02:07.839 --> 00:02:09.839
Cloudflare does have another totally different

00:02:09.839 --> 00:02:12.999
offering for this use case and that is called the

00:02:12.999 --> 00:02:13.279
workers,

00:02:14.229 --> 00:02:16.589
workers for platforms which give you a few

00:02:16.589 --> 00:02:17.269
different features.

00:02:17.269 --> 00:02:17.789
Like they have,

00:02:17.789 --> 00:02:17.989
it's,

00:02:17.989 --> 00:02:20.109
it's $25 base price month and then it's per

00:02:20.109 --> 00:02:20.869
additional usage.

00:02:20.869 --> 00:02:21.189
So

00:02:21.739 --> 00:02:23.179
basically it's the same pricing as workers,

00:02:23.579 --> 00:02:25.259
development process is the same as workers.

00:02:25.259 --> 00:02:27.339
But like one of the main things is you can like

00:02:27.339 --> 00:02:29.779
dynamically create resources and then dynamically

00:02:29.779 --> 00:02:31.819
bind to those resources inside of a worker.

00:02:31.819 --> 00:02:34.179
So you can build like a more true multi tenant

00:02:34.179 --> 00:02:34.579
setup.

00:02:34.579 --> 00:02:37.539
But in order to do that you need to like have the

00:02:37.539 --> 00:02:39.499
foundations of how to build on workers solidified.

00:02:39.499 --> 00:02:41.139
And that's what this course is going to focus on.

00:02:41.139 --> 00:02:42.499
We're not going to be focusing on like the really

00:02:42.499 --> 00:02:43.939
complicated multi tenant setup,

00:02:43.939 --> 00:02:45.659
we're going to be focusing on how to like build

00:02:45.659 --> 00:02:47.899
full stack applications really well using all the

00:02:47.899 --> 00:02:48.699
Cloudflare services.

00:02:48.859 --> 00:02:50.459
So that's what we're going to stick to.

00:02:50.459 --> 00:02:50.859
So

00:02:51.169 --> 00:02:52.129
as part of this course,

00:02:52.129 --> 00:02:53.569
like we're going to be using D1.

00:02:53.649 --> 00:02:55.689
And what you're going to notice if you're kind of

00:02:55.689 --> 00:02:57.449
reading through documentations trying to sort out

00:02:57.449 --> 00:02:59.329
how to build with D1,

00:02:59.329 --> 00:03:01.729
you're going to see examples like this where you

00:03:01.729 --> 00:03:04.129
have a fetch handler and then you get your

00:03:04.459 --> 00:03:07.369
D1 database through the environment binding and

00:03:07.369 --> 00:03:09.809
then you say prepare and you write some SQL query

00:03:09.809 --> 00:03:11.489
and then you get your data to your user.

00:03:11.569 --> 00:03:12.809
Now this path is totally fine.

00:03:12.809 --> 00:03:13.929
You can write queries like this,

00:03:13.929 --> 00:03:15.689
but when you're building like a really big

00:03:15.689 --> 00:03:15.969
project,

00:03:16.209 --> 00:03:18.089
you're going to want to bring in some tooling that

00:03:18.089 --> 00:03:21.129
kind of helps make this process more type safe and

00:03:21.129 --> 00:03:23.189
more scalable in terms of scaling your code base.

00:03:23.189 --> 00:03:26.018
And that's where like an ORM comes into play where

00:03:26.018 --> 00:03:26.361
you can,

00:03:26.361 --> 00:03:28.161
instead of writing raw SQL statements,

00:03:28.161 --> 00:03:30.241
you can have your schemas defined inside of your

00:03:30.241 --> 00:03:30.841
code base,

00:03:30.841 --> 00:03:32.961
so your tables defined inside of your code base.

00:03:33.121 --> 00:03:35.521
And then you can bring in an ORM like Drizzle or

00:03:35.521 --> 00:03:36.521
there's other orms out there.

00:03:36.521 --> 00:03:37.761
I think Drizzle is one of the best one,

00:03:37.991 --> 00:03:39.791
where you can basically programmatically create

00:03:39.791 --> 00:03:42.591
your queries where you say database.select.

00:03:42.591 --> 00:03:43.511
from users,

00:03:43.641 --> 00:03:46.481
and Then you can have like joins and filters and

00:03:46.481 --> 00:03:47.001
whatnot.

00:03:47.001 --> 00:03:49.441
So this is just like a way of like creating really

00:03:49.441 --> 00:03:50.151
type safe,

00:03:50.291 --> 00:03:53.691
queries and kind of abstracting the query creation

00:03:53.691 --> 00:03:56.171
logic away from like traditional SQL statements

00:03:56.171 --> 00:03:58.571
where like you might write a SQL statement inside

00:03:58.571 --> 00:04:00.491
of your code base but you have a syntax error or

00:04:00.491 --> 00:04:02.931
you're like having a table that's the wrong name.

00:04:02.931 --> 00:04:04.531
And then all of a sudden your application crashes

00:04:04.531 --> 00:04:05.851
out of nowhere and you're trying to figure out why

00:04:05.851 --> 00:04:06.330
and it's like,

00:04:06.330 --> 00:04:06.611
oh,

00:04:06.611 --> 00:04:06.811
well,

00:04:06.811 --> 00:04:08.971
I wrote the wrong query because this is just a

00:04:08.971 --> 00:04:09.331
string.

00:04:09.411 --> 00:04:09.811
And

00:04:10.131 --> 00:04:12.051
the only time I know if it's going to fail is

00:04:12.051 --> 00:04:13.411
during runtime where this,

00:04:13.411 --> 00:04:16.091
during build time it's going to error out if like

00:04:16.091 --> 00:04:16.931
you're using a

00:04:17.491 --> 00:04:19.011
table name that is not defined.

00:04:19.561 --> 00:04:20.561
so it's really nice.

00:04:20.561 --> 00:04:22.521
You can kind of like makes that building process a

00:04:22.521 --> 00:04:22.921
lot easier.

00:04:22.921 --> 00:04:24.761
It makes your data type safe when you get data

00:04:24.761 --> 00:04:25.881
back from your database.

00:04:26.521 --> 00:04:28.521
now there's another issue with this pattern though

00:04:28.521 --> 00:04:30.641
that you'll find in documentations is like,

00:04:30.641 --> 00:04:31.321
you'll have your,

00:04:31.901 --> 00:04:34.121
you'll have your D1 database provided from a

00:04:34.121 --> 00:04:36.121
binding and then you'll pass it into the drizzle

00:04:36.121 --> 00:04:38.281
method and then from there you have the Drizzle

00:04:38.281 --> 00:04:39.601
database where you can write queries.

00:04:39.601 --> 00:04:41.681
But what you'll notice here is,

00:04:41.681 --> 00:04:42.681
I guess not what you'll notice,

00:04:42.681 --> 00:04:44.201
but like what you'll find out as you're building

00:04:44.201 --> 00:04:46.161
bigger projects is you're going to have tons and

00:04:46.161 --> 00:04:47.881
tons of different API endpoints and server

00:04:47.881 --> 00:04:48.821
functions and whatnot.

00:04:48.821 --> 00:04:50.221
And this thing is going to be very,

00:04:50.221 --> 00:04:53.181
very repetitive where you continually pass in

00:04:53.434 --> 00:04:53.830
the same,

00:04:53.830 --> 00:04:56.190
like database instance into your drizzle,

00:04:56.510 --> 00:04:57.150
method.

00:04:57.310 --> 00:04:59.590
And then you're creating like a query inside of

00:04:59.590 --> 00:05:00.910
your application code.

00:05:00.910 --> 00:05:01.310
And

00:05:01.830 --> 00:05:03.030
it's fine for smaller projects,

00:05:03.030 --> 00:05:04.070
but as things get big,

00:05:04.070 --> 00:05:05.750
you'll notice like you have a lot of the same

00:05:05.750 --> 00:05:07.870
queries that you're continuously rewriting and

00:05:07.870 --> 00:05:08.310
rewriting.

00:05:08.310 --> 00:05:10.390
And that's kind of where the monorepo setup comes

00:05:10.390 --> 00:05:10.590
in,

00:05:10.590 --> 00:05:12.710
where we're able to abstract the,

00:05:12.790 --> 00:05:14.630
or move the queries to a different

00:05:15.170 --> 00:05:15.650
package,

00:05:15.730 --> 00:05:16.850
kind of define them.

00:05:16.930 --> 00:05:19.610
Say like this query is meant for this use case and

00:05:19.610 --> 00:05:21.330
then we can use it throughout our project.

00:05:21.410 --> 00:05:21.810
So like,

00:05:21.810 --> 00:05:23.810
it would kind of be something like this where you

00:05:23.810 --> 00:05:24.130
have

00:05:24.450 --> 00:05:26.530
a package called Data Ops.

00:05:26.530 --> 00:05:27.810
It's in our project right now,

00:05:27.810 --> 00:05:29.650
it's in our monorepo and we're going to have a

00:05:29.650 --> 00:05:31.410
bunch of different SQL queries defined in there

00:05:31.410 --> 00:05:34.490
that are written using the Drizzle rm and then

00:05:34.490 --> 00:05:36.290
they're going to be imported throughout,

00:05:36.370 --> 00:05:37.310
all of our applications.

00:05:37.310 --> 00:05:38.630
This project is only going to have two

00:05:38.630 --> 00:05:39.070
applications.

00:05:39.070 --> 00:05:40.830
But as your service grows and your use cases

00:05:40.830 --> 00:05:42.110
become more sophisticated,

00:05:42.110 --> 00:05:43.750
you might be having more deployables,

00:05:43.750 --> 00:05:45.150
like independent applications.

00:05:45.390 --> 00:05:47.290
And then you'll be able to source the same queries

00:05:47.290 --> 00:05:49.210
so you don't have a whole bunch of like redundant

00:05:49.210 --> 00:05:50.730
code all throughout your code base.

00:05:51.210 --> 00:05:53.290
Another pattern that I like to follow is,

00:05:53.850 --> 00:05:54.850
if you notice here,

00:05:54.850 --> 00:05:57.290
this drizzle instance is taking in the D1

00:05:57.290 --> 00:05:57.850
database.

00:05:57.850 --> 00:06:00.570
But if you connect to other database providers,

00:06:00.570 --> 00:06:02.970
like the way that you create this object is

00:06:02.970 --> 00:06:03.290
different.

00:06:03.450 --> 00:06:03.830
Like

00:06:03.870 --> 00:06:04.750
With neon,

00:06:04.990 --> 00:06:06.830
you pass in a query

00:06:07.150 --> 00:06:07.870
URL

00:06:08.230 --> 00:06:08.630
with

00:06:09.219 --> 00:06:09.619
with.

00:06:09.859 --> 00:06:10.459
Let's see,

00:06:10.459 --> 00:06:12.699
Supabase is like another scenario where like

00:06:12.699 --> 00:06:14.799
you're using a different orm,

00:06:14.799 --> 00:06:15.359
like a different.

00:06:15.359 --> 00:06:17.039
So this one is postgresjs.

00:06:17.459 --> 00:06:20.379
you're passing in that URL and then planetscale is

00:06:20.379 --> 00:06:22.219
going to be a little bit different where you are

00:06:22.219 --> 00:06:25.299
using the PlanetScale serverless as part of the

00:06:25.299 --> 00:06:26.259
Drizzle RM.

00:06:26.419 --> 00:06:28.539
And then you're passing in individually like a

00:06:28.539 --> 00:06:30.339
host and a username and a password.

00:06:30.419 --> 00:06:32.499
So if at your application layer,

00:06:32.499 --> 00:06:35.379
like you are defining drizzle like this throughout

00:06:35.379 --> 00:06:37.139
your code in tons of different places,

00:06:37.139 --> 00:06:38.899
and then you swap out your database provider,

00:06:38.979 --> 00:06:40.419
all of a sudden you're gonna have to go through

00:06:40.419 --> 00:06:41.739
like your entire code base.

00:06:41.739 --> 00:06:42.819
You're gonna have to update

00:06:43.329 --> 00:06:43.569
the

00:06:43.619 --> 00:06:45.559
the actual import statement for drizzle.

00:06:45.559 --> 00:06:46.479
And then you're gonna have to.

00:06:46.879 --> 00:06:48.559
And you're gonna have to update the way that it's

00:06:48.559 --> 00:06:50.119
instantiated across your entire code base,

00:06:50.119 --> 00:06:52.439
which would make migrating to a different database

00:06:52.439 --> 00:06:53.119
very difficult.

00:06:53.119 --> 00:06:55.199
And one of the reasons why I think orms are great

00:06:55.279 --> 00:06:56.959
is you could in theory migrate to a different

00:06:56.959 --> 00:06:58.159
database with more ease.

00:06:58.159 --> 00:07:00.519
So I'm going to show you the monorepo setup where

00:07:00.519 --> 00:07:02.359
you kind of alleviate all of these problems.

00:07:02.359 --> 00:07:02.839
So we can,

00:07:02.839 --> 00:07:04.013
we can get into that right now.

00:07:04.064 --> 00:07:04.384
All right,

00:07:04.384 --> 00:07:06.584
so if we navigate back to our project and we come

00:07:06.584 --> 00:07:07.424
into the packages

00:07:07.824 --> 00:07:09.064
Data Ops folder,

00:07:09.064 --> 00:07:12.304
essentially this is a package and this package is

00:07:12.304 --> 00:07:14.344
going to contain code that's shared at different

00:07:14.344 --> 00:07:15.744
services or different apps.

00:07:15.744 --> 00:07:17.864
So in the Data Ops package we're going to have

00:07:17.864 --> 00:07:18.714
information like

00:07:18.714 --> 00:07:19.284
we're going to have,

00:07:19.284 --> 00:07:21.164
we're going to have like our database queries,

00:07:21.164 --> 00:07:22.284
we're going to have Zod schemas,

00:07:22.284 --> 00:07:22.964
we're going to have

00:07:23.524 --> 00:07:24.764
logic that can be shared,

00:07:24.764 --> 00:07:25.604
that's a little bit more common,

00:07:25.604 --> 00:07:27.324
that can be shared across different services and

00:07:27.324 --> 00:07:28.924
then they're going to be used in our user

00:07:28.924 --> 00:07:29.244
application,

00:07:29.244 --> 00:07:31.004
so our front end application and then also our

00:07:31.004 --> 00:07:31.754
data service that,

00:07:31.824 --> 00:07:33.264
that we're going to be spending a lot of time

00:07:33.264 --> 00:07:33.784
building out.

00:07:33.784 --> 00:07:35.824
Now as your application scales there could be

00:07:36.144 --> 00:07:37.504
scenarios where you

00:07:37.794 --> 00:07:39.314
are building out different services,

00:07:39.474 --> 00:07:41.794
different deployables and it's really nice to have

00:07:41.874 --> 00:07:44.394
your generic code easily shareable across all of

00:07:44.394 --> 00:07:44.674
these

00:07:44.784 --> 00:07:45.764
different applications.

00:07:45.764 --> 00:07:47.444
So that's a process that we're going to follow

00:07:47.444 --> 00:07:47.924
right now.

00:07:48.324 --> 00:07:48.724
And

00:07:49.234 --> 00:07:51.344
before we create our database inside,

00:07:51.344 --> 00:07:52.384
before we create our data,

00:07:52.384 --> 00:07:54.704
our database and our tables in Cloudflare,

00:07:55.044 --> 00:07:56.804
just kind of like walk through the structure a

00:07:56.804 --> 00:07:57.164
little bit.

00:07:57.164 --> 00:07:57.804
So this,

00:07:57.874 --> 00:07:59.314
this is a pmpm,

00:07:59.714 --> 00:08:01.174
workspace like package

00:08:01.734 --> 00:08:04.254
and we have some scripts defined inside of the

00:08:04.254 --> 00:08:05.654
package JSON file.

00:08:05.654 --> 00:08:08.294
And a lot of these scripts are related to Drizzle.

00:08:08.294 --> 00:08:08.614
And

00:08:08.814 --> 00:08:10.734
if you're not familiar with like the full process

00:08:10.734 --> 00:08:12.734
of building on top of Drizzle or using Drizzle,

00:08:12.734 --> 00:08:14.494
I actually have a pretty decent video on it that

00:08:14.494 --> 00:08:15.094
I'll link to.

00:08:15.154 --> 00:08:16.834
and their documentation is pretty good as well.

00:08:16.834 --> 00:08:18.994
But you have these concepts of like if you have a

00:08:18.994 --> 00:08:20.034
schema that exists

00:08:20.354 --> 00:08:21.794
you can run some commands,

00:08:22.604 --> 00:08:25.204
specifically Drizzle Kit Poll that will pull in

00:08:25.204 --> 00:08:27.964
those tables and it will create a whole bunch of

00:08:28.234 --> 00:08:31.084
typescript files that represent those tables and

00:08:31.084 --> 00:08:33.124
they are called schemas and then you can use those

00:08:33.124 --> 00:08:34.514
schemas to create queries.

00:08:34.514 --> 00:08:36.084
and there's like some other things like migrate

00:08:36.084 --> 00:08:37.604
and generate that we're actually not going to use

00:08:37.604 --> 00:08:38.564
too much in this course.

00:08:38.954 --> 00:08:41.224
Studio gives us an interactive query environment.

00:08:41.544 --> 00:08:43.144
So these are kind of the things that we're going

00:08:43.144 --> 00:08:44.184
to worry about right now.

00:08:44.314 --> 00:08:46.284
and in order to make this happen what we need to

00:08:46.284 --> 00:08:47.924
do is we need to head over to our Drizzle

00:08:47.924 --> 00:08:48.604
configuration.

00:08:48.764 --> 00:08:51.364
And what this does is this basically says okay,

00:08:51.364 --> 00:08:53.304
this is how you authenticate to our database.

00:08:53.704 --> 00:08:54.104
And

00:08:54.504 --> 00:08:56.704
then when we actually pull information from your

00:08:56.704 --> 00:08:58.984
database and then we create some like typescript

00:08:58.984 --> 00:08:59.304
files.

00:08:59.304 --> 00:09:00.104
Where do those go?

00:09:00.104 --> 00:09:01.864
And that's what this out command does.

00:09:01.864 --> 00:09:02.544
It basically says,

00:09:02.544 --> 00:09:03.544
inside of our source,

00:09:03.704 --> 00:09:06.104
we're going to output some of these drizzle,

00:09:06.114 --> 00:09:06.704
schemas,

00:09:06.704 --> 00:09:08.744
and it's going to create some files inside of our

00:09:08.744 --> 00:09:09.384
code base.

00:09:09.384 --> 00:09:09.784
So,

00:09:09.974 --> 00:09:11.084
that's what we're going to go through now.

00:09:11.084 --> 00:09:12.804
And you're going to notice that we have some of

00:09:12.804 --> 00:09:13.084
these.

00:09:13.734 --> 00:09:14.214
we have,

00:09:14.214 --> 00:09:14.414
like,

00:09:14.414 --> 00:09:14.694
these,

00:09:14.854 --> 00:09:15.974
the Cloudflare account ID,

00:09:15.974 --> 00:09:16.734
the database ID,

00:09:16.734 --> 00:09:18.214
and a Cloudflare D1 token.

00:09:18.214 --> 00:09:19.454
So we're going to go through the process of

00:09:19.454 --> 00:09:20.374
creating this right now.

00:09:20.374 --> 00:09:21.694
So first we're going to create the table,

00:09:21.694 --> 00:09:22.924
then we're going to configure it,

00:09:23.074 --> 00:09:23.874
work with Drizzle,

00:09:23.874 --> 00:09:24.994
and we'll go from there.

00:09:25.154 --> 00:09:27.797
So if we head over to our Cloudflare dashboard,

00:09:28.152 --> 00:09:30.552
We can head under the storage and database section

00:09:30.872 --> 00:09:33.552
and then let's head over to D1 SQL database.

00:09:33.552 --> 00:09:35.912
And you can see we don't have any database created

00:09:35.912 --> 00:09:36.392
right now.

00:09:36.392 --> 00:09:37.632
So we're going to go ahead and we're going to

00:09:37.632 --> 00:09:39.832
create a database and for this project we're going

00:09:39.832 --> 00:09:40.392
to call it,

00:09:40.842 --> 00:09:44.202
Smart Links and we'll say that's our project name

00:09:44.362 --> 00:09:46.442
and then we're going to say stage.

00:09:46.442 --> 00:09:49.682
And the reason why I'm saying dash stage here is

00:09:49.682 --> 00:09:50.042
because

00:09:50.442 --> 00:09:50.802
at the,

00:09:50.802 --> 00:09:51.802
towards the end of this project,

00:09:51.802 --> 00:09:53.682
I'm going to show you how to create multiple

00:09:53.682 --> 00:09:55.082
environments of your application.

00:09:55.082 --> 00:09:57.302
So you could have like one for testing and for

00:09:57.302 --> 00:09:57.622
development

00:09:57.942 --> 00:09:59.542
and for actually like,

00:09:59.542 --> 00:10:00.022
you know,

00:10:00.022 --> 00:10:02.662
building out ideas that you can test before you

00:10:02.662 --> 00:10:04.902
actually move it to the production version that's

00:10:04.902 --> 00:10:05.742
user facing.

00:10:05.742 --> 00:10:06.102
So,

00:10:06.312 --> 00:10:08.322
everything that is like we're developing now is

00:10:08.322 --> 00:10:10.442
going to be like dash stage and then later we'll

00:10:10.442 --> 00:10:13.162
have one that's meant for production so we can hit

00:10:13.162 --> 00:10:13.482
create.

00:10:13.496 --> 00:10:14.924
Now what that's going to do is this gives us a

00:10:14.924 --> 00:10:16.724
database and we're going to come look at the

00:10:16.724 --> 00:10:17.644
settings really quick.

00:10:17.724 --> 00:10:18.124
But

00:10:18.384 --> 00:10:19.944
in order to get this to work with,

00:10:20.674 --> 00:10:21.714
to work with Drizzle,

00:10:21.954 --> 00:10:23.274
we need a few different things.

00:10:23.274 --> 00:10:24.754
We need our account id.

00:10:24.754 --> 00:10:27.514
The account ID can be found in two places.

00:10:27.514 --> 00:10:29.874
One it can be found at like this first section of

00:10:29.874 --> 00:10:30.514
the URL,

00:10:30.514 --> 00:10:32.194
but it's kind of messy to get it from there.

00:10:32.754 --> 00:10:34.594
So what you can do is you come over to workers

00:10:35.234 --> 00:10:37.714
and they should have this section where like it's

00:10:37.714 --> 00:10:38.354
account id.

00:10:38.514 --> 00:10:40.034
So we're going to go ahead and copy that.

00:10:40.934 --> 00:10:43.454
and then first what I'm going to do is I am going

00:10:43.454 --> 00:10:44.374
to paste in

00:10:46.034 --> 00:10:46.914
So we're going to,

00:10:46.994 --> 00:10:50.594
at the root of the data ops package,

00:10:50.754 --> 00:10:53.074
we're going to create a file called.emb

00:10:54.114 --> 00:10:54.674
and this,

00:10:54.674 --> 00:10:56.514
you should make sure that this is always in your

00:10:56.594 --> 00:10:58.914
git ignore so you don't accidentally push these to

00:10:58.914 --> 00:10:59.354
GitHub.

00:10:59.354 --> 00:11:01.234
And then we're going to say Cloudflare account ID

00:11:01.974 --> 00:11:03.034
equals this account ID.

00:11:03.552 --> 00:11:05.792
We're also going to do the same for our Cloudflare

00:11:05.792 --> 00:11:06.352
database.

00:11:06.352 --> 00:11:08.592
So we're going to say cloudflare D1 database

00:11:08.672 --> 00:11:09.312
equals.

00:11:09.792 --> 00:11:11.632
Head back over to the

00:11:12.352 --> 00:11:13.632
storage and databases

00:11:14.112 --> 00:11:15.552
D1 SQL database.

00:11:15.951 --> 00:11:18.272
Click on that guy and let's copy that

00:11:18.312 --> 00:11:19.192
database link.

00:11:19.832 --> 00:11:21.232
Now just know all these steps.

00:11:21.232 --> 00:11:22.992
You could also create and manage your database

00:11:22.992 --> 00:11:24.312
from the Wrangler cli.

00:11:24.432 --> 00:11:26.212
I just want to like make sure we're also familiar

00:11:26.212 --> 00:11:27.652
with the dashboard.

00:11:27.972 --> 00:11:30.652
Now the last thing that we need is a Cloudflare D1

00:11:30.652 --> 00:11:31.002
token.

00:11:31.152 --> 00:11:33.192
Now this one is a little bit less documented,

00:11:33.192 --> 00:11:35.072
which is kind of why I think a course is valuable,

00:11:35.072 --> 00:11:36.352
as you can see this process.

00:11:36.352 --> 00:11:39.592
But essentially Cloudflare gives you API tokens

00:11:39.592 --> 00:11:41.872
that allow you to also manage resources via an

00:11:41.872 --> 00:11:42.352
API.

00:11:42.352 --> 00:11:45.312
And that's what the Drizzle Kit is using as well

00:11:45.312 --> 00:11:47.072
for authentication with Cloudflare.

00:11:47.232 --> 00:11:47.632
So,

00:11:47.892 --> 00:11:48.872
we can head over to

00:11:49.672 --> 00:11:51.272
Manage account at the bottom left.

00:11:51.752 --> 00:11:54.132
you can go to account APIs and then what we're

00:11:54.132 --> 00:11:55.952
going to do is we're going to say create a token

00:11:56.342 --> 00:11:58.312
and there's a bunch of these like pre built ones.

00:11:58.462 --> 00:11:59.102
usually typically,

00:11:59.102 --> 00:12:00.302
I typically don't use these templates.

00:12:00.302 --> 00:12:01.102
I just say like,

00:12:01.102 --> 00:12:02.302
let's do a custom token.

00:12:02.542 --> 00:12:04.462
We're going to say get started and I'm going to

00:12:04.462 --> 00:12:05.262
call this my

00:12:05.902 --> 00:12:07.662
Smart Links DB

00:12:07.982 --> 00:12:08.622
token.

00:12:08.622 --> 00:12:10.422
And you're only going to ever be able to see this

00:12:10.422 --> 00:12:10.782
once.

00:12:10.902 --> 00:12:13.102
so just make sure you save it and secure it

00:12:13.102 --> 00:12:13.542
somewhere.

00:12:13.952 --> 00:12:15.192
then what we're going to do is I'm going to search

00:12:15.192 --> 00:12:16.112
for D1.

00:12:16.192 --> 00:12:17.152
I type D1,

00:12:17.152 --> 00:12:18.192
it's at the very bottom.

00:12:18.562 --> 00:12:20.592
so this is going to Give access to D1 and what

00:12:20.592 --> 00:12:22.272
types of permissions we're going to want to give

00:12:22.272 --> 00:12:23.192
it edit permission.

00:12:23.522 --> 00:12:25.202
so we can also write and update stuff.

00:12:25.602 --> 00:12:27.962
And we're going to say continue to summary create

00:12:27.962 --> 00:12:28.362
token.

00:12:28.362 --> 00:12:30.322
Now I will be deleting this token later,

00:12:30.562 --> 00:12:33.082
so don't try to like steal it because it's just

00:12:33.082 --> 00:12:33.682
this whole,

00:12:33.842 --> 00:12:35.342
this whole this token will be gone.

00:12:36.212 --> 00:12:39.172
now I'm going to come on over to my Cloudflare D1

00:12:39.172 --> 00:12:40.932
token and we're going to add this here.

00:12:41.452 --> 00:12:44.372
we're going to save and then just make sure that

00:12:44.372 --> 00:12:45.772
you're CD into packages,

00:12:45.772 --> 00:12:46.412
so CD

00:12:47.612 --> 00:12:48.252
packages.

00:12:48.515 --> 00:12:50.475
And then we're going to say data Ops.

00:12:50.475 --> 00:12:52.515
So now we're at the root level of Data Ops.

00:12:52.755 --> 00:12:54.595
And what we're going to want to do is we're going

00:12:54.595 --> 00:12:55.995
to want to pull in some,

00:12:55.995 --> 00:12:57.515
we're going to basically want to like make sure

00:12:57.515 --> 00:12:58.195
everything's working.

00:12:58.355 --> 00:12:58.755
So

00:12:58.965 --> 00:12:59.815
as you can see here,

00:12:59.815 --> 00:13:02.295
we have a package JSON file.

00:13:02.725 --> 00:13:03.035
nope,

00:13:03.035 --> 00:13:03.315
sorry,

00:13:03.315 --> 00:13:04.035
wrong section.

00:13:04.035 --> 00:13:06.675
In the Data Ops source we have a

00:13:07.075 --> 00:13:08.675
package JSON file

00:13:08.995 --> 00:13:10.955
and we have a pull script.

00:13:10.955 --> 00:13:12.355
So this is going to pull whatever

00:13:12.765 --> 00:13:15.005
tables exist inside of our D1 database,

00:13:15.005 --> 00:13:16.285
which none exist right now,

00:13:16.365 --> 00:13:17.965
and they're going to put them in the code base.

00:13:17.965 --> 00:13:18.605
So I'm going to say

00:13:19.085 --> 00:13:20.365
PNPM run

00:13:20.765 --> 00:13:21.325
poll.

00:13:22.722 --> 00:13:23.422
wrong words.

00:13:23.422 --> 00:13:24.422
PNPM run.

00:13:25.509 --> 00:13:25.909
All right,

00:13:25.909 --> 00:13:27.269
so you're going to see something like this,

00:13:27.269 --> 00:13:28.529
where it's getting all of these,

00:13:28.649 --> 00:13:30.729
where it's getting all of the tables and then it

00:13:30.729 --> 00:13:30.929
like,

00:13:30.929 --> 00:13:32.889
finishes different migrations and

00:13:33.209 --> 00:13:36.129
ultimately you now have a Drizzle out folder

00:13:36.129 --> 00:13:36.849
inside of your project.

00:13:36.849 --> 00:13:38.809
And that Drizzle out folder is going to have a

00:13:38.969 --> 00:13:39.959
schema's file and.

00:13:40.029 --> 00:13:40.629
And spoiler alert.

00:13:40.629 --> 00:13:42.149
We don't have any schemas yet because we haven't

00:13:42.149 --> 00:13:43.349
created any tables,

00:13:43.349 --> 00:13:44.982
but we're going to go ahead and do that right now.

00:13:45.145 --> 00:13:48.105
So let's head back over to the Cloudflare UI

00:13:48.505 --> 00:13:51.465
and let's go back to our database section and

00:13:51.465 --> 00:13:52.585
let's click on our

00:13:52.819 --> 00:13:53.792
Smart links,

00:13:53.802 --> 00:13:54.532
stage table.

00:13:54.532 --> 00:13:56.092
And then this is actually pretty,

00:13:56.092 --> 00:13:57.692
a relatively new feature by Cloudflare.

00:13:57.692 --> 00:13:59.212
The UI might change a little bit around it,

00:13:59.212 --> 00:14:02.052
but we can say explore data and they give us like

00:14:02.052 --> 00:14:03.172
our own interactive

00:14:03.322 --> 00:14:04.712
query environment where we can

00:14:05.112 --> 00:14:05.992
create tables,

00:14:05.992 --> 00:14:07.272
write queries and whatnot.

00:14:07.272 --> 00:14:08.832
So we're going to go ahead and create a few

00:14:08.832 --> 00:14:09.392
different tables.

00:14:09.392 --> 00:14:10.872
The first table that we're going to create

00:14:11.412 --> 00:14:13.492
called links and don't worry about typing this,

00:14:13.492 --> 00:14:14.212
I'm going to paste,

00:14:14.212 --> 00:14:15.492
I'm going to make sure it's paste.

00:14:15.492 --> 00:14:16.972
I'm going to have it in the bottom of the video.

00:14:16.972 --> 00:14:17.972
You'll be able to paste it.

00:14:17.972 --> 00:14:20.092
So we're going to create a links table and that

00:14:20.092 --> 00:14:22.332
links table is going to have like ID about the

00:14:22.332 --> 00:14:22.692
link,

00:14:22.722 --> 00:14:24.692
and account ID destinations.

00:14:24.692 --> 00:14:26.252
It has like a whole bunch of different information

00:14:26.332 --> 00:14:26.892
that is

00:14:27.002 --> 00:14:27.732
that's useful.

00:14:27.812 --> 00:14:29.412
So we can go ahead and we can

00:14:29.982 --> 00:14:30.772
run that guy.

00:14:31.187 --> 00:14:33.547
We're also going to create a table called Link

00:14:33.547 --> 00:14:35.357
Clicks and this is going to be that

00:14:35.667 --> 00:14:37.747
table that powers the analytics.

00:14:37.747 --> 00:14:39.267
So all of like the actual like

00:14:39.946 --> 00:14:42.866
so all of the like dashboard related stuff where

00:14:42.866 --> 00:14:45.146
we're able to see like how many queries were

00:14:45.466 --> 00:14:47.906
how many click link clicks per link per region and

00:14:47.906 --> 00:14:48.306
whatnot.

00:14:48.306 --> 00:14:50.165
So that's what this table is going to be

00:14:50.165 --> 00:14:51.465
and we can go ahead and run that guy

00:14:51.576 --> 00:14:53.537
and then we are going to,

00:14:54.035 --> 00:14:56.075
we're going to create a few different indexes as

00:14:56.075 --> 00:14:56.355
well.

00:14:56.515 --> 00:14:56.915
So

00:14:57.255 --> 00:14:59.725
this is actually probably not necessary for this

00:14:59.725 --> 00:15:00.045
project.

00:15:00.285 --> 00:15:00.685
But

00:15:00.925 --> 00:15:02.465
when we create indexes on tables,

00:15:02.465 --> 00:15:04.425
it's basically creating data structures

00:15:04.745 --> 00:15:05.705
for each table

00:15:06.185 --> 00:15:06.825
that allow

00:15:07.245 --> 00:15:09.125
reads and writes to be more performant.

00:15:09.125 --> 00:15:11.125
Well technically in this case reads will be more

00:15:11.125 --> 00:15:11.645
performant,

00:15:11.645 --> 00:15:12.965
writes will be less performant.

00:15:12.965 --> 00:15:15.405
But a lot of times if you have like a scenario

00:15:15.405 --> 00:15:18.125
where you have data that's segmented by account

00:15:18.535 --> 00:15:20.295
and then every single query you have is kind of

00:15:20.295 --> 00:15:20.855
filtering,

00:15:20.855 --> 00:15:22.935
I want to find all the data for an account.

00:15:24.075 --> 00:15:26.235
you might want to index based upon an account so

00:15:26.235 --> 00:15:28.755
your query can isolate those accounts really

00:15:28.755 --> 00:15:30.155
quickly and then scan the data.

00:15:30.515 --> 00:15:33.075
if you want to learn more about like how to manage

00:15:33.075 --> 00:15:33.714
schemas,

00:15:33.714 --> 00:15:35.155
how to write performing queries,

00:15:35.155 --> 00:15:37.475
how to like learn more about indexes if that's not

00:15:37.475 --> 00:15:39.355
your forte or you don't have like a lot of

00:15:39.355 --> 00:15:40.595
experience in the data world.

00:15:40.995 --> 00:15:43.155
PlanetScale actually has this course which I'll

00:15:43.155 --> 00:15:44.835
link at the bottom of this video where

00:15:45.635 --> 00:15:46.515
they go into like,

00:15:46.755 --> 00:15:48.675
like it's actually pretty high level but it goes

00:15:48.675 --> 00:15:49.355
relatively deep.

00:15:49.355 --> 00:15:51.475
So like they teach you about schemas and data

00:15:51.475 --> 00:15:53.315
types and how to write performant queries and how

00:15:53.315 --> 00:15:54.275
to index and like,

00:15:54.275 --> 00:15:55.795
I honestly think this is probably one of the best

00:15:55.795 --> 00:15:57.075
like free SQL like

00:15:57.315 --> 00:15:58.235
resources out there.

00:15:58.235 --> 00:16:01.035
So it applies for SQLite and for like these

00:16:01.035 --> 00:16:02.435
concepts are kind of the same across different

00:16:02.435 --> 00:16:03.075
databases.

00:16:03.475 --> 00:16:04.475
So don't think like,

00:16:04.475 --> 00:16:04.675
oh,

00:16:04.675 --> 00:16:04.795
well,

00:16:04.795 --> 00:16:05.875
I'm not using PlanetScale.

00:16:05.875 --> 00:16:06.195
Like it,

00:16:06.195 --> 00:16:06.675
it is

00:16:07.075 --> 00:16:09.635
these concepts kind of like cascade past just like

00:16:09.635 --> 00:16:10.415
one database,

00:16:10.415 --> 00:16:11.352
type or provider.

00:16:11.921 --> 00:16:12.321
All right,

00:16:12.401 --> 00:16:13.921
so let's head back over to here.

00:16:14.161 --> 00:16:15.681
I'm going to run these indexes,

00:16:15.788 --> 00:16:16.752
run all these guys.

00:16:16.891 --> 00:16:17.449
And then

00:16:17.599 --> 00:16:19.809
the last table that we are going to create

00:16:19.905 --> 00:16:20.475
is called

00:16:21.035 --> 00:16:21.675
destination

00:16:23.035 --> 00:16:24.235
evaluations.

00:16:24.395 --> 00:16:25.675
So this guy right here

00:16:26.315 --> 00:16:28.315
is the table that basically

00:16:29.035 --> 00:16:31.715
keeps track of like the evaluations that our AI

00:16:31.715 --> 00:16:32.035
runs.

00:16:32.035 --> 00:16:34.475
So our AI is going to like programmatically go

00:16:34.475 --> 00:16:34.795
through,

00:16:34.875 --> 00:16:36.835
find different like destination links.

00:16:36.835 --> 00:16:37.915
It's going to load the page,

00:16:37.915 --> 00:16:40.315
it's going to look at the content of the page and

00:16:40.315 --> 00:16:40.995
it's going to tell us like,

00:16:40.995 --> 00:16:41.195
hey,

00:16:41.195 --> 00:16:43.275
is this product sold out or is this page no longer

00:16:43.275 --> 00:16:43.515
available?

00:16:43.515 --> 00:16:44.435
It's going to be a pretty like,

00:16:44.435 --> 00:16:46.515
smart AI system and then we're going to have to

00:16:46.515 --> 00:16:48.515
kind of like store metadata about that process and

00:16:48.515 --> 00:16:49.634
that's what this table is going to be.

00:16:49.634 --> 00:16:51.475
I know I'm going like over these tables really

00:16:51.475 --> 00:16:51.915
quickly.

00:16:51.995 --> 00:16:53.475
They're going to make a lot more sense as we

00:16:53.475 --> 00:16:54.115
progress further.

00:16:54.115 --> 00:16:56.675
But the main purpose of this section of the video

00:16:56.675 --> 00:16:59.035
is we need to create a,

00:16:59.375 --> 00:17:00.915
we need to create our tables.

00:17:00.915 --> 00:17:03.035
That way we can actually start like using those

00:17:03.035 --> 00:17:04.195
tables in our application.

00:17:04.836 --> 00:17:06.836
So the main point that I want to drive here home

00:17:06.836 --> 00:17:08.076
now is we have tables,

00:17:08.076 --> 00:17:09.396
we have all of them created.

00:17:09.876 --> 00:17:12.476
Now if we head back over to our repo and we make

00:17:12.476 --> 00:17:13.716
sure we are in our

00:17:14.224 --> 00:17:16.024
we are in the Data Ops package,

00:17:16.024 --> 00:17:17.024
not the application.

00:17:17.184 --> 00:17:18.704
And then we say pnpm,

00:17:18.864 --> 00:17:20.064
run Poll

00:17:20.384 --> 00:17:22.464
Drizzle is now going to

00:17:22.864 --> 00:17:23.984
dynamically create

00:17:24.304 --> 00:17:25.104
all of these

00:17:25.554 --> 00:17:26.184
schemas

00:17:26.504 --> 00:17:27.704
based upon the,

00:17:27.890 --> 00:17:30.108
based upon the tables that we just created,

00:17:30.318 --> 00:17:32.118
in our Cloudflare D1 database.

00:17:32.118 --> 00:17:34.158
So you can see we have our links table,

00:17:34.548 --> 00:17:36.738
we have our link clicks table

00:17:37.248 --> 00:17:39.408
and we have our destination evaluation.

00:17:39.408 --> 00:17:41.408
So these are the three tables that we have

00:17:41.408 --> 00:17:41.848
created.

00:17:41.848 --> 00:17:44.208
And now what we can do is we can use these schemas

00:17:44.208 --> 00:17:46.968
to write queries that will actually like insert

00:17:46.968 --> 00:17:49.281
data into our table or read data from our tables.

