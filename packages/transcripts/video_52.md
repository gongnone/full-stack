WEBVTT
X-TIMESTAMP-MAP=LOCAL:00:00:00.000,MPEGTS:900000

00:00:00.087 --> 00:00:02.487
So to understand how Better Auth is going to fit

00:00:02.487 --> 00:00:04.087
into our current data workflow,

00:00:04.167 --> 00:00:06.807
let's quickly go over how we're currently using

00:00:06.807 --> 00:00:07.327
Drizzle.

00:00:07.327 --> 00:00:07.548
Right now,

00:00:07.548 --> 00:00:09.828
currently we are creating our tables manually

00:00:09.908 --> 00:00:12.788
inside of the Cloudflare D1 studio.

00:00:13.108 --> 00:00:14.628
Once those tables are created,

00:00:14.628 --> 00:00:16.868
we're running a Drizzle poll command which is

00:00:16.868 --> 00:00:19.988
basically saying configuring Drizzle on our inside

00:00:19.988 --> 00:00:21.548
of our IDE in our code base and,

00:00:21.698 --> 00:00:22.578
and then we're

00:00:22.898 --> 00:00:25.058
providing the authentication to our database and

00:00:25.058 --> 00:00:26.898
then we're running poll and that's taking those

00:00:26.898 --> 00:00:29.418
table definitions and it's creating actual

00:00:29.418 --> 00:00:31.778
JavaScript drizzle schemas out of them.

00:00:32.018 --> 00:00:33.138
Once we have those schemas,

00:00:33.138 --> 00:00:34.898
we're able to use those in our code base right

00:00:34.898 --> 00:00:35.198
now,

00:00:35.198 --> 00:00:36.617
by basically creating queries,

00:00:36.617 --> 00:00:38.778
interfacing with the database and then using these

00:00:38.778 --> 00:00:41.298
schemas to give us type safe interaction with our

00:00:41.298 --> 00:00:41.578
data.

00:00:42.138 --> 00:00:42.538
Now

00:00:42.938 --> 00:00:43.338
what

00:00:43.738 --> 00:00:44.378
we currently,

00:00:44.698 --> 00:00:46.378
or basically what we're going to

00:00:46.698 --> 00:00:49.298
move to with this new model is this Drizzle

00:00:49.298 --> 00:00:50.538
workflow is going to stay the same,

00:00:50.888 --> 00:00:52.888
but we're going to introduce Better Auth and

00:00:52.968 --> 00:00:53.688
Better Auth.

00:00:54.008 --> 00:00:56.648
The Drizzle adapter for Better Auth is.

00:00:57.048 --> 00:00:57.728
It's okay,

00:00:57.728 --> 00:01:00.168
there is some like quirks with it that I do think

00:01:00.168 --> 00:01:02.128
we're going to kind of like go through just so you

00:01:02.128 --> 00:01:02.568
can understand.

00:01:02.648 --> 00:01:04.208
And I do think once you kind of understand this

00:01:04.208 --> 00:01:06.528
pattern and some of the edge cases you might run

00:01:06.528 --> 00:01:06.808
into,

00:01:06.888 --> 00:01:08.568
you'll be able to roll your own Auth,

00:01:08.748 --> 00:01:11.148
using Drizzle and Better Auth in the future with

00:01:11.148 --> 00:01:12.588
really any database provider.

00:01:13.148 --> 00:01:16.518
So we'll start by configuring Better Authentic to

00:01:16.518 --> 00:01:17.638
essentially say,

00:01:17.638 --> 00:01:17.918
hey,

00:01:17.918 --> 00:01:19.718
we're going to have certain plugins,

00:01:19.718 --> 00:01:21.118
we're going to need our,

00:01:21.118 --> 00:01:21.638
you know,

00:01:21.638 --> 00:01:25.038
normal authentication tables and maybe we want

00:01:25.038 --> 00:01:27.358
like other plugins like organizations or Stripe.

00:01:27.358 --> 00:01:28.478
We're not going to do that right now.

00:01:28.478 --> 00:01:28.808
But

00:01:28.828 --> 00:01:29.188
you'll,

00:01:29.188 --> 00:01:31.108
you'll understand how as we kind of go through

00:01:31.108 --> 00:01:31.388
this,

00:01:31.787 --> 00:01:33.028
once that's configured,

00:01:33.028 --> 00:01:34.108
we're going to point

00:01:34.258 --> 00:01:36.728
a command that Better Auth gives us through the

00:01:36.728 --> 00:01:39.968
CLI to basically look at this configuration and

00:01:39.968 --> 00:01:40.768
then it's going to

00:01:41.338 --> 00:01:42.298
generate schemas.

00:01:42.298 --> 00:01:43.858
Now there's two things that we could do here.

00:01:43.858 --> 00:01:47.298
We could technically just like generate raw SQL

00:01:47.298 --> 00:01:48.458
statements or

00:01:49.098 --> 00:01:50.758
because we're already using Drizzle,

00:01:50.758 --> 00:01:53.598
we can pass in a Drizzle adapter and then Better

00:01:53.598 --> 00:01:55.973
Auth will create actual Drizzle schemas.

00:01:56.018 --> 00:01:58.338
Now once those Drizzle schemas are created,

00:01:58.498 --> 00:02:01.538
we'll wire it into our existing Drizzle

00:02:01.538 --> 00:02:02.258
Configuration

00:02:02.658 --> 00:02:04.978
and then we'll be able to generate the SQL from

00:02:04.978 --> 00:02:06.178
those Drizzle schemas.

00:02:06.818 --> 00:02:07.778
We can run those

00:02:07.838 --> 00:02:09.458
we can create those tables manually once we get

00:02:09.458 --> 00:02:10.718
those schemas like those table

00:02:10.918 --> 00:02:12.078
definitions created

00:02:12.478 --> 00:02:14.918
and then we'll be able to basically just use our

00:02:14.918 --> 00:02:16.078
schemas for our auth

00:02:16.138 --> 00:02:18.558
the same way we use other tables in our database.

00:02:18.638 --> 00:02:20.918
So I know that this is very abstract.

00:02:20.918 --> 00:02:22.878
It's going to become much more concrete in just a

00:02:22.878 --> 00:02:23.045
minute.

00:02:23.148 --> 00:02:25.068
So what I've done here is I have

00:02:25.388 --> 00:02:26.988
headed over to our

00:02:27.388 --> 00:02:30.748
Data Ops package and I actually opened this in its

00:02:30.748 --> 00:02:31.068
own

00:02:31.518 --> 00:02:33.838
IDE window just because in this section we're

00:02:33.838 --> 00:02:35.988
only going to be touching the DataOps package.

00:02:37.278 --> 00:02:37.918
Now I currently

00:02:38.238 --> 00:02:40.998
have some boilerplate authentication stuff built

00:02:40.998 --> 00:02:42.078
out that we're going to modify.

00:02:42.318 --> 00:02:44.918
So what you'll likely be seeing is something like

00:02:44.918 --> 00:02:45.118
this.

00:02:45.118 --> 00:02:47.878
We have an auth gen folder and there's some

00:02:47.878 --> 00:02:48.638
boilerplate

00:02:48.738 --> 00:02:49.338
better auth

00:02:49.838 --> 00:02:52.118
configuration and this is basically just coming

00:02:52.118 --> 00:02:54.238
from the better auth documentation.

00:02:55.524 --> 00:02:56.834
If you click on Getting Started

00:02:57.394 --> 00:03:00.234
Basic usage you'll see there's some like basic

00:03:00.234 --> 00:03:02.514
usage on how you can create a better auth

00:03:02.514 --> 00:03:02.984
configuration.

00:03:03.294 --> 00:03:06.174
And this type of method is used to one generate

00:03:06.194 --> 00:03:09.494
our tables through the cli but it's also used to

00:03:09.494 --> 00:03:11.294
integrate into our application code

00:03:11.544 --> 00:03:12.664
during runtime.

00:03:12.664 --> 00:03:13.064
So

00:03:13.504 --> 00:03:15.264
what we're going to do is we can just look at a

00:03:15.264 --> 00:03:15.984
few different things here.

00:03:15.984 --> 00:03:18.064
What we care about is we care about Google so we

00:03:18.064 --> 00:03:19.104
can head over to the

00:03:19.604 --> 00:03:21.484
provider and then you're going to notice when you

00:03:21.484 --> 00:03:23.684
configure better auth you basically need to pass

00:03:23.684 --> 00:03:24.554
in a provider.

00:03:24.974 --> 00:03:27.054
so it takes Google and it takes like a client ID

00:03:27.054 --> 00:03:27.494
and secret.

00:03:27.494 --> 00:03:29.134
We're going to do this in a later video.

00:03:30.254 --> 00:03:32.334
and then the other thing that we care about is

00:03:32.334 --> 00:03:33.294
actual databases.

00:03:33.614 --> 00:03:34.014
So

00:03:35.534 --> 00:03:37.814
if we head down to this databases section you're

00:03:37.814 --> 00:03:39.094
going to see that there's some basic

00:03:39.094 --> 00:03:40.814
configurations and this is just like

00:03:40.884 --> 00:03:42.954
this is basically just having like some of these

00:03:42.954 --> 00:03:45.194
really popular libraries for interacting with

00:03:45.194 --> 00:03:45.794
databases.

00:03:46.434 --> 00:03:48.834
So you have connection pool with MySQL,

00:03:49.084 --> 00:03:49.694
Postgres,

00:03:49.694 --> 00:03:50.654
you have this Postgres,

00:03:50.654 --> 00:03:51.694
this PG driver.

00:03:51.854 --> 00:03:54.454
And under the hood inside of this better auth it's

00:03:54.454 --> 00:03:56.014
using a library called Kingsley

00:03:56.384 --> 00:03:56.624
and

00:03:57.294 --> 00:03:59.444
it's like a very very very powerful kind of query

00:03:59.444 --> 00:04:02.484
builder kind of ORM similar to Drizzle just like I

00:04:02.484 --> 00:04:04.364
would say a little bit like more vetted.

00:04:04.364 --> 00:04:06.644
It's older and it's used by a lot of like

00:04:06.644 --> 00:04:08.164
enterprise level code bases.

00:04:09.114 --> 00:04:11.313
now what you're going to notice is if you look at

00:04:11.313 --> 00:04:11.794
SQLite,

00:04:11.794 --> 00:04:13.834
you're basically just passing in this like SQLite

00:04:13.914 --> 00:04:16.554
database that's just creating a database inside of

00:04:16.554 --> 00:04:17.074
your code base.

00:04:17.074 --> 00:04:18.474
And this is obviously not what we're doing.

00:04:18.554 --> 00:04:19.914
We're going to be using D1.

00:04:20.154 --> 00:04:20.714
Luckily,

00:04:20.874 --> 00:04:21.674
if you

00:04:21.994 --> 00:04:23.074
don't have like,

00:04:23.074 --> 00:04:25.274
if you're not using these out of the box libraries

00:04:25.274 --> 00:04:26.354
to interface with your data,

00:04:26.354 --> 00:04:26.714
especially

00:04:27.174 --> 00:04:27.894
server of this world,

00:04:28.054 --> 00:04:29.734
you're typically going to be using Drizzle.

00:04:29.734 --> 00:04:32.614
You'll be using a database that basically has a

00:04:32.614 --> 00:04:35.454
proxy in front of it that proxies your request via

00:04:35.454 --> 00:04:36.134
HTTP.

00:04:36.614 --> 00:04:37.014
And

00:04:37.334 --> 00:04:39.934
for that type of setup they have this adapter and

00:04:39.934 --> 00:04:42.214
this is basically a Drizzle adapter where instead

00:04:42.214 --> 00:04:44.294
of passing in like a SQLite database,

00:04:44.374 --> 00:04:46.054
you pass in the Drizzle adapter,

00:04:46.214 --> 00:04:48.614
you give it the database name and then you give it

00:04:48.614 --> 00:04:50.214
like what type of provider it is.

00:04:51.014 --> 00:04:52.854
So we're basically going to be following this

00:04:52.854 --> 00:04:55.334
setup for our current implementation because we're

00:04:55.334 --> 00:04:56.253
already using Drizzle.

00:04:56.558 --> 00:04:58.758
So heading back over to our code base,

00:04:58.758 --> 00:05:00.558
what we're first going to do is we're going to

00:05:00.558 --> 00:05:03.078
want to go into our source and we can create a new

00:05:03.078 --> 00:05:03.505
file.

00:05:03.505 --> 00:05:05.100
This new file can just be called

00:05:05.420 --> 00:05:05.820
auth

00:05:06.300 --> 00:05:06.940
ts.

00:05:09.906 --> 00:05:11.747
Let's go ahead and import a few things that we

00:05:11.747 --> 00:05:12.227
care about.

00:05:12.307 --> 00:05:13.947
So what I'm going to do is I'm going to,

00:05:13.947 --> 00:05:15.947
in a similar way to what we're doing with our

00:05:15.947 --> 00:05:18.507
database where we're kind of having this DB

00:05:18.507 --> 00:05:20.607
instance that's going to be instantiated

00:05:20.627 --> 00:05:21.607
during runtime.

00:05:21.687 --> 00:05:23.447
We're going to do something similar with auth.

00:05:23.527 --> 00:05:24.967
So we're going to create this auth,

00:05:25.147 --> 00:05:25.707
variable

00:05:26.107 --> 00:05:28.227
that is going to have the return type of Better

00:05:28.227 --> 00:05:28.587
Auth.

00:05:28.747 --> 00:05:29.307
Now this,

00:05:29.387 --> 00:05:31.467
this setup is going to basically help us kind of

00:05:31.567 --> 00:05:32.127
do two things.

00:05:32.127 --> 00:05:33.447
We're going to be able to integrate with our

00:05:33.447 --> 00:05:34.287
application but also

00:05:34.767 --> 00:05:37.247
manage our configuration with the cli.

00:05:37.407 --> 00:05:39.887
So I'm going to go ahead and pull in this

00:05:40.667 --> 00:05:41.027
called

00:05:41.667 --> 00:05:42.787
Create Better Auth.

00:05:43.027 --> 00:05:45.307
This is something that we're going to define and

00:05:45.307 --> 00:05:47.427
essentially what we're going to do is we are going

00:05:47.427 --> 00:05:48.947
to pass in a database

00:05:49.277 --> 00:05:51.197
and this database can be any type of database.

00:05:51.197 --> 00:05:52.637
Ours is going to be a

00:05:52.957 --> 00:05:55.237
Drizzle adapter with the Drizzle database passed

00:05:55.237 --> 00:05:55.757
into it.

00:05:56.077 --> 00:05:58.237
And then we're optionally going to have some

00:05:58.737 --> 00:05:59.377
configuration.

00:05:59.377 --> 00:06:01.657
And then obviously as you bring in more providers,

00:06:01.657 --> 00:06:03.217
you can kind of extend this logic.

00:06:03.777 --> 00:06:04.177
Now,

00:06:04.407 --> 00:06:06.607
we're going to configure this to basically say

00:06:06.607 --> 00:06:07.887
we're not going to do email password,

00:06:07.887 --> 00:06:09.743
we're going to allow our provider to

00:06:09.743 --> 00:06:10.486
essentially

00:06:10.686 --> 00:06:13.006
just totally manage authentication for us.

00:06:13.246 --> 00:06:15.966
And then what we're going to do is we're going to

00:06:15.966 --> 00:06:18.246
be passing in our Google tokens into the Google

00:06:18.246 --> 00:06:18.646
provider.

00:06:18.646 --> 00:06:18.926
And

00:06:19.226 --> 00:06:21.066
the reason why this is optional and why these

00:06:21.066 --> 00:06:23.306
default to an empty string is because when we are

00:06:23.386 --> 00:06:24.506
generating our schemas,

00:06:24.506 --> 00:06:26.026
we're not going to be passing in like Google

00:06:26.026 --> 00:06:26.786
credentials and stuff.

00:06:26.786 --> 00:06:27.986
There's really no need for it.

00:06:27.998 --> 00:06:30.603
but when we actually do this during like the

00:06:30.603 --> 00:06:31.563
running of the application,

00:06:31.563 --> 00:06:32.963
we're going to want to be able to feed this

00:06:32.963 --> 00:06:33.660
information in.

00:06:33.660 --> 00:06:35.071
Next thing that we're going to do is we're going

00:06:35.071 --> 00:06:36.351
to create a method called

00:06:36.991 --> 00:06:37.791
get off.

00:06:37.819 --> 00:06:39.843
And what get auth is going to do is it's going to

00:06:39.843 --> 00:06:40.803
take in the

00:06:41.563 --> 00:06:43.163
Google credentials and these are going to be

00:06:43.163 --> 00:06:44.763
required because this is actually going to be used

00:06:44.763 --> 00:06:45.662
inside of our code base.

00:06:45.662 --> 00:06:47.092
And then we will be

00:06:47.492 --> 00:06:49.172
using this create better Auth

00:06:49.942 --> 00:06:50.982
function that we have.

00:06:51.462 --> 00:06:53.782
And we're going to pass in a drizzle adapter

00:06:54.502 --> 00:06:56.622
as the database and we're going to be passing in

00:06:56.622 --> 00:06:57.662
our get database,

00:06:57.662 --> 00:07:00.262
which is our logic for actually extracting our D1

00:07:00.262 --> 00:07:00.702
database.

00:07:00.702 --> 00:07:03.022
Now I know there's a few layers of abstraction

00:07:03.022 --> 00:07:03.222
here,

00:07:03.222 --> 00:07:05.582
but it will start to make sense as you keep

00:07:05.582 --> 00:07:06.902
building why this is nice.

00:07:06.902 --> 00:07:09.022
Just because everything's kind of self contained

00:07:09.022 --> 00:07:11.372
in one area and if you want to make any types of,

00:07:11.522 --> 00:07:13.202
of like major configuration change,

00:07:13.362 --> 00:07:15.002
you really only have to do it in one place.

00:07:15.002 --> 00:07:16.642
You're not like going throughout your entire app

00:07:16.642 --> 00:07:18.442
trying to find every single time you've defined

00:07:18.442 --> 00:07:21.082
something and then also like reconfiguring it.

00:07:21.142 --> 00:07:21.542
All right,

00:07:21.542 --> 00:07:23.702
so we're passing in Google as well and then we're

00:07:23.702 --> 00:07:24.662
returning better Auth.

00:07:25.536 --> 00:07:27.936
So now the goal is to essentially create,

00:07:27.936 --> 00:07:29.296
to take this better Auth

00:07:29.696 --> 00:07:31.376
and to come over to

00:07:31.936 --> 00:07:34.252
our Auth gen folder into Auth TS

00:07:34.262 --> 00:07:36.822
and then what we can do is we can replace this.

00:07:37.222 --> 00:07:37.622
So

00:07:37.832 --> 00:07:38.992
we're actually going to,

00:07:38.992 --> 00:07:40.712
I think we're going to have some issues importing

00:07:40.712 --> 00:07:41.032
this.

00:07:41.512 --> 00:07:44.272
The main reason is because our TS config is

00:07:44.272 --> 00:07:44.712
specific,

00:07:44.712 --> 00:07:46.792
is configured in a specific way for this build.

00:07:47.512 --> 00:07:49.512
So what we're going to do is we're also going to

00:07:49.512 --> 00:07:49.832
include

00:07:51.352 --> 00:07:52.472
Auth gen in here.

00:07:53.272 --> 00:07:55.592
And then one thing that we'll have to do if we

00:07:55.592 --> 00:07:57.552
include Auth gen in here is we'll also have to

00:07:57.552 --> 00:07:59.112
like reconfigure our exports.

00:07:59.112 --> 00:08:00.237
But we'll do that in just a minute.

00:08:00.491 --> 00:08:03.891
now when we head over to our Auth TS inside of

00:08:03.891 --> 00:08:04.491
auth gen,

00:08:04.571 --> 00:08:06.091
we should be able to import this.

00:08:06.344 --> 00:08:06.415
I'll

00:08:06.415 --> 00:08:07.414
delete these as we can,

00:08:07.414 --> 00:08:08.196
kind of clean them up.

00:08:08.196 --> 00:08:10.533
And then the next thing that we're going to do is

00:08:10.533 --> 00:08:13.160
we're basically going to take a drizzle adapter,

00:08:13.179 --> 00:08:14.459
pass it inside of here,

00:08:15.659 --> 00:08:16.939
make sure we import this

00:08:17.212 --> 00:08:18.463
and then we're going to provide two things.

00:08:18.463 --> 00:08:19.263
We're going to provide

00:08:19.894 --> 00:08:20.654
an empty database,

00:08:20.654 --> 00:08:21.734
so basically an object,

00:08:22.374 --> 00:08:24.694
and then we're going to pass in a

00:08:25.654 --> 00:08:28.374
provider which is going to be SQLite.

00:08:29.078 --> 00:08:29.664
All right,

00:08:29.744 --> 00:08:31.264
so now that this is set up,

00:08:31.344 --> 00:08:34.464
we can kind of start like actually working on the

00:08:34.754 --> 00:08:36.444
schema generation aspect of it.

00:08:37.084 --> 00:08:39.324
So what we're going to do is we're going to come

00:08:39.324 --> 00:08:41.696
over to our package JSON file

00:08:41.696 --> 00:08:43.338
and we have this better auth

00:08:43.788 --> 00:08:45.158
we have this better authentic

00:08:45.788 --> 00:08:46.668
path or

00:08:47.308 --> 00:08:50.028
generator essentially it's using the better auth

00:08:50.028 --> 00:08:52.548
cli and it's running generate and it's basically

00:08:52.548 --> 00:08:55.788
saying our config file is located in auth gen auth

00:08:55.788 --> 00:08:56.188
ts,

00:08:56.188 --> 00:08:57.548
which is this file that we just

00:08:59.408 --> 00:09:02.048
now we're going to provide one other thing which

00:09:02.048 --> 00:09:03.488
is going to be an output.

00:09:03.488 --> 00:09:05.728
Basically the output is going to be a schema

00:09:06.368 --> 00:09:08.528
and what we can do is we can come over here

00:09:09.728 --> 00:09:11.568
and we can basically say we're going to go into

00:09:11.568 --> 00:09:13.688
source drizzle out auth schema.

00:09:13.688 --> 00:09:15.248
So what that's going to do is it's going to find

00:09:15.248 --> 00:09:16.398
our drizzle out folder

00:09:16.948 --> 00:09:19.188
and it's going to generate an output schema

00:09:19.188 --> 00:09:21.205
alongside our current drizzle schema.

00:09:21.246 --> 00:09:23.406
So we should be able to actually run this right

00:09:23.406 --> 00:09:23.726
now.

00:09:23.726 --> 00:09:25.966
So I'm going to say pnpm run

00:09:26.606 --> 00:09:27.886
better auth generate.

00:09:28.846 --> 00:09:30.766
It might give a few warnings because

00:09:31.086 --> 00:09:33.526
for example it's missing the client ID and client

00:09:33.526 --> 00:09:34.246
secret for Google.

00:09:34.246 --> 00:09:35.086
That's totally fine.

00:09:35.566 --> 00:09:38.006
So we just hit yes and then what we're going to

00:09:38.006 --> 00:09:39.849
notice is our auth schema

00:09:39.937 --> 00:09:41.137
is now created.

00:09:41.137 --> 00:09:42.897
So you can see that There is the

00:09:43.217 --> 00:09:45.697
SQLite table representation and drizzle

00:09:45.907 --> 00:09:46.947
of a specific,

00:09:46.947 --> 00:09:48.707
like of these specific tables.

00:09:48.787 --> 00:09:49.187
So

00:09:49.487 --> 00:09:50.817
we have a user,

00:09:50.817 --> 00:09:52.017
we have a session,

00:09:52.337 --> 00:09:53.217
we have an account

00:09:53.617 --> 00:09:54.017
and

00:09:54.577 --> 00:09:55.456
we have

00:09:55.937 --> 00:09:56.722
verification.

00:09:56.848 --> 00:09:58.768
The next thing we're going to want to do is we're

00:09:58.768 --> 00:10:00.128
going to want to get the actual

00:10:01.378 --> 00:10:04.098
the actual SQL create statements for these tables

00:10:04.098 --> 00:10:04.818
so we can go

00:10:05.138 --> 00:10:07.938
create these tables in our D1 database.

00:10:08.418 --> 00:10:09.208
So what we're going to do,

00:10:09.358 --> 00:10:11.438
do in order to do that is we're going to come into

00:10:11.438 --> 00:10:13.678
here and I'm going to delete meta because this is

00:10:13.678 --> 00:10:14.798
A generated file.

00:10:15.358 --> 00:10:17.638
And we're not actually using this to manage our

00:10:17.638 --> 00:10:18.078
schemas.

00:10:18.078 --> 00:10:19.758
We're just kind of like getting a SQL

00:10:20.238 --> 00:10:20.638
statement.

00:10:21.038 --> 00:10:22.718
I'm going to delete the SQL file.

00:10:22.798 --> 00:10:25.878
So in this folder we have all schema relations and

00:10:25.878 --> 00:10:26.883
schema at this point.

00:10:27.010 --> 00:10:28.812
Now we can head over to Drizzle Config

00:10:28.812 --> 00:10:31.334
and inside of here we're going to add one property

00:10:31.334 --> 00:10:33.534
called schema and this is going to point to the

00:10:33.534 --> 00:10:34.534
schemas in our project.

00:10:34.694 --> 00:10:36.424
So it's pointing to the.

00:10:36.574 --> 00:10:38.254
This schema which is our

00:10:38.844 --> 00:10:41.044
actual like business logic schema and also auth

00:10:41.044 --> 00:10:41.644
schema.

00:10:41.884 --> 00:10:44.084
For now we can probably just remove this because

00:10:44.084 --> 00:10:45.644
we don't necessarily like,

00:10:45.884 --> 00:10:47.884
we're not necessarily using this feature for

00:10:48.124 --> 00:10:48.924
schema management.

00:10:49.084 --> 00:10:50.724
We're just going to be getting a,

00:10:50.724 --> 00:10:53.684
some SQL like we're trying to generate a SQL file

00:10:53.684 --> 00:10:54.684
with our create statement.

00:10:54.764 --> 00:10:55.164
So

00:10:55.484 --> 00:10:56.204
I'm going to,

00:10:56.444 --> 00:10:57.484
we're going to go like this.

00:10:57.764 --> 00:11:00.084
I should have a command in here already for us

00:11:00.084 --> 00:11:01.004
called Generate.

00:11:01.004 --> 00:11:03.724
This is running the Drizzle Kit command and it's

00:11:03.724 --> 00:11:06.684
basically going to generate SQL file like a SQL

00:11:06.684 --> 00:11:09.124
create statements for so PNPM run

00:11:09.684 --> 00:11:10.404
generate.

00:11:11.444 --> 00:11:13.124
Now we can head over here and what we're going to

00:11:13.124 --> 00:11:14.314
notice is we have these

00:11:14.314 --> 00:11:15.464
we essentially have these

00:11:16.254 --> 00:11:18.214
create statements that's been

00:11:18.344 --> 00:11:18.694
spit out.

00:11:18.694 --> 00:11:20.054
So our user table,

00:11:20.054 --> 00:11:20.813
our session,

00:11:20.813 --> 00:11:22.494
our account and our verification.

00:11:22.732 --> 00:11:25.292
So we can go ahead and copy all of these

00:11:28.857 --> 00:11:30.377
and we can head over to

00:11:31.497 --> 00:11:32.284
Cloudflare.

00:11:32.322 --> 00:11:34.442
We're going to navigate over to our storage and

00:11:34.442 --> 00:11:35.082
databases.

00:11:35.082 --> 00:11:36.322
D1 SQL database.

00:11:36.322 --> 00:11:37.442
We'll start with Stage.

00:11:38.002 --> 00:11:39.282
Let's explore data

00:11:39.682 --> 00:11:41.602
and I'm going to pass these guys in.

00:11:41.602 --> 00:11:43.482
So these are all of the create statements that we

00:11:43.482 --> 00:11:43.762
need.

00:11:43.771 --> 00:11:45.532
Going to come over here and I'm going to say

00:11:46.342 --> 00:11:47.152
run all.

00:11:47.442 --> 00:11:49.642
So that's executing six different statements.

00:11:49.642 --> 00:11:50.082
Perfect.

00:11:50.082 --> 00:11:51.307
So we've created those tables.

00:11:51.679 --> 00:11:54.439
Now let's head over to our production database and

00:11:54.439 --> 00:11:55.679
let's do the same thing for that one.

00:11:55.759 --> 00:11:57.279
So we'll go over to explore data,

00:11:57.919 --> 00:11:59.039
pass these guys in.

00:11:59.439 --> 00:12:01.119
We're just going to run all statements.

00:12:01.359 --> 00:12:02.964
It should create all six as well.

00:12:03.000 --> 00:12:05.240
Now we have six new tables for managing

00:12:05.240 --> 00:12:05.854
authentication.

00:12:05.906 --> 00:12:07.626
One of the last things we're going to have to do

00:12:07.626 --> 00:12:09.186
in terms of configuration for

00:12:09.786 --> 00:12:10.326
Drizzle

00:12:10.726 --> 00:12:11.126
is

00:12:11.446 --> 00:12:13.766
in the actual client that we're going to be using.

00:12:13.926 --> 00:12:14.966
So inside of source

00:12:15.736 --> 00:12:16.776
auth ts,

00:12:17.240 --> 00:12:19.920
where we are passing in our actual Drizzle

00:12:19.920 --> 00:12:20.440
adapter,

00:12:20.760 --> 00:12:23.320
we're also now going to have to provide references

00:12:23.400 --> 00:12:24.600
to those schemas.

00:12:25.080 --> 00:12:26.880
So we're going to have to provide a reference to

00:12:26.880 --> 00:12:27.880
the user schema

00:12:33.080 --> 00:12:34.600
and the account schema.

00:12:36.440 --> 00:12:38.360
And the last one is verification.

00:12:39.560 --> 00:12:41.160
Now I like manually,

00:12:41.160 --> 00:12:43.760
like I like manually configuring all this stuff

00:12:43.760 --> 00:12:44.680
and kind of doing it

00:12:45.020 --> 00:12:45.580
incrementally.

00:12:45.580 --> 00:12:48.460
Just because now we have context as to what

00:12:48.460 --> 00:12:48.860
tables.

00:12:48.860 --> 00:12:50.540
We have what those tables look like.

00:12:50.700 --> 00:12:52.380
And if we bring in another plugin,

00:12:52.380 --> 00:12:53.100
for example,

00:12:53.100 --> 00:12:55.180
if we were to come over to here

00:12:55.500 --> 00:12:58.860
and we were to say we want to configure a plugin

00:12:59.340 --> 00:13:01.700
and we want to make the plugin organizations.

00:13:01.700 --> 00:13:02.380
For example,

00:13:04.085 --> 00:13:05.285
when we run our

00:13:05.375 --> 00:13:05.765
our

00:13:06.965 --> 00:13:07.765
drizzle or,

00:13:07.765 --> 00:13:08.205
sorry,

00:13:08.205 --> 00:13:10.325
our better AUTH generate command,

00:13:10.685 --> 00:13:12.405
what's going to happen is we're going to get a new

00:13:12.405 --> 00:13:13.085
schema

00:13:13.865 --> 00:13:14.705
for organizations,

00:13:14.705 --> 00:13:15.985
and we can go through the same process.

00:13:16.145 --> 00:13:18.225
So whenever you make an update to the

00:13:18.225 --> 00:13:20.345
configuration at the better AUTH layer,

00:13:20.345 --> 00:13:21.705
you have to make sure you go through the process

00:13:21.705 --> 00:13:23.985
of actually like creating those schemas,

00:13:23.985 --> 00:13:25.015
making sure you get the

00:13:25.355 --> 00:13:27.115
the SQL statements for them and then make sure

00:13:27.115 --> 00:13:27.915
your table is.

00:13:27.995 --> 00:13:29.275
Those tables are created.

00:13:29.355 --> 00:13:31.115
But we're not going to worry about plugins for the

00:13:31.115 --> 00:13:31.595
time being.

00:13:33.115 --> 00:13:33.675
All right,

00:13:34.155 --> 00:13:36.475
so before we conclude,

00:13:36.635 --> 00:13:38.675
there's just a little bit of cleanup that we have

00:13:38.675 --> 00:13:40.835
to do if we head over to package,

00:13:40.835 --> 00:13:41.675
what you're going to not.

00:13:42.055 --> 00:13:43.655
I'm going to go ahead and it looks like we don't

00:13:43.655 --> 00:13:44.535
have DIST here.

00:13:44.855 --> 00:13:45.295
Okay.

00:13:45.295 --> 00:13:46.509
So if we head over to package

00:13:46.635 --> 00:13:47.035
and

00:13:47.334 --> 00:13:48.503
I think we'll just do it from here.

00:13:48.503 --> 00:13:50.383
So if we head over to

00:13:50.863 --> 00:13:52.522
our package JSON,

00:13:53.242 --> 00:13:55.482
what we're going to notice is these exports are

00:13:55.482 --> 00:13:57.842
actually not valid anymore because we modified

00:13:57.842 --> 00:13:59.802
what is included inside of our build.

00:13:59.962 --> 00:14:00.362
So

00:14:00.820 --> 00:14:01.220
the

00:14:02.120 --> 00:14:04.440
last thing that we're going to have to do here is

00:14:04.440 --> 00:14:06.280
we're going to just go ahead delete dist.

00:14:06.280 --> 00:14:07.360
We don't need it for the time being.

00:14:07.360 --> 00:14:08.960
I just want to show you what's going to happen if

00:14:08.960 --> 00:14:10.600
we say PNPM run build.

00:14:12.308 --> 00:14:13.308
Essentially the.

00:14:13.788 --> 00:14:16.108
Essentially what's happened is instead of all of

00:14:16.108 --> 00:14:18.148
our files being output just right here in the

00:14:18.148 --> 00:14:18.388
dist,

00:14:18.388 --> 00:14:20.828
we now have source and we now have AUTH gen.

00:14:21.068 --> 00:14:21.230
So

00:14:21.230 --> 00:14:22.730
you can delete DIST one more time.

00:14:23.140 --> 00:14:24.860
And what I'm going to do is I'm going to head over

00:14:24.860 --> 00:14:26.100
to the package JSON

00:14:26.580 --> 00:14:28.580
and everywhere where it says dist

00:14:28.900 --> 00:14:29.540
like this,

00:14:30.420 --> 00:14:32.604
we're just going to do a bulk update.

00:14:32.710 --> 00:14:34.330
I haven't done this in VS code in a long time.

00:14:34.330 --> 00:14:34.770
Okay.

00:14:34.930 --> 00:14:36.610
And then I'm going to also say

00:14:37.170 --> 00:14:37.730
source

00:14:39.330 --> 00:14:40.210
forward slash.

00:14:45.214 --> 00:14:45.454
Sorry.

00:14:45.454 --> 00:14:46.734
Let's just try that one more time.

00:14:47.761 --> 00:14:49.961
So just make sure we're updating the right stuff

00:14:49.961 --> 00:14:50.161
here.

00:14:50.161 --> 00:14:50.601
Yep.

00:14:50.601 --> 00:14:51.841
So we're going to update everything.

00:14:52.401 --> 00:14:52.841
All right,

00:14:52.841 --> 00:14:54.561
so now these should all be pointing at Source

00:14:54.561 --> 00:14:55.081
correctly.

00:14:55.081 --> 00:14:57.281
And then the last thing we're going to do is I

00:14:57.281 --> 00:14:58.881
actually have this point out the wrong thing.

00:14:58.881 --> 00:14:59.281
Originally,

00:14:59.281 --> 00:15:00.641
I had this in a better off

00:15:01.351 --> 00:15:01.791
folder,

00:15:01.791 --> 00:15:04.351
but it's just at the root level of Source.

00:15:04.351 --> 00:15:05.351
So we can delete that.

00:15:06.711 --> 00:15:07.991
We can delete that.

00:15:09.351 --> 00:15:11.591
And then now PNPM run build one more time.

00:15:16.023 --> 00:15:17.392
And now inside of Source,

00:15:17.392 --> 00:15:19.432
we have all the information that we need for this,

00:15:19.912 --> 00:15:22.312
and everything's exported in our client

00:15:22.312 --> 00:15:24.312
application is going to be able to pick it up.

00:15:24.392 --> 00:15:26.512
This is also something that's nice about the PNPM

00:15:26.512 --> 00:15:27.032
workspace.

00:15:27.032 --> 00:15:28.632
Notice that we change paths here,

00:15:29.042 --> 00:15:31.842
but because we're exporting it with these aliases,

00:15:32.162 --> 00:15:34.002
we don't have to change anything in the front end

00:15:34.162 --> 00:15:35.602
for all of our import statements.

00:15:35.602 --> 00:15:36.192
So that's pretty cool.

00:15:36.230 --> 00:15:37.750
So now that everything's configured,

00:15:37.830 --> 00:15:39.270
we have our tables created.

00:15:39.430 --> 00:15:41.030
Let's go wire this into,

00:15:42.230 --> 00:15:43.670
our client application.

