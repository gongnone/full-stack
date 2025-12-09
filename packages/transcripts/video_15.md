WEBVTT
X-TIMESTAMP-MAP=LOCAL:00:00:00.000,MPEGTS:900000

00:00:00.844 --> 00:00:03.484
so now let's actually integrate some of our data

00:00:03.484 --> 00:00:06.324
operations into this code so we can build out the

00:00:06.324 --> 00:00:07.324
routing logic.

00:00:07.324 --> 00:00:11.004
So I'm going to just get rid of this stuff as we

00:00:11.004 --> 00:00:11.724
really don't

00:00:12.044 --> 00:00:13.244
need it at the moment.

00:00:14.124 --> 00:00:15.804
we're going to start from scratch here.

00:00:15.884 --> 00:00:17.404
So just to kind of recap,

00:00:17.404 --> 00:00:20.724
the ID that is passed through here is going to be

00:00:20.724 --> 00:00:22.524
the actual link id

00:00:23.024 --> 00:00:25.584
and we have that data stored in our database.

00:00:25.824 --> 00:00:26.224
So

00:00:26.614 --> 00:00:27.184
we also,

00:00:27.344 --> 00:00:28.224
if you remember,

00:00:28.464 --> 00:00:31.026
inside of our Data Ops package

00:00:31.026 --> 00:00:34.405
we actually have some useful methods that we built

00:00:34.405 --> 00:00:35.725
out and we have,

00:00:35.805 --> 00:00:37.884
or we should have already built out

00:00:38.365 --> 00:00:39.245
the actual

00:00:39.585 --> 00:00:40.225
the actual

00:00:40.865 --> 00:00:43.345
query to get the link information given,

00:00:43.585 --> 00:00:44.385
given an id.

00:00:44.625 --> 00:00:47.275
So we have a get link takes a link ID and,

00:00:47.345 --> 00:00:49.185
and then just simply returns the

00:00:49.965 --> 00:00:50.685
configuration,

00:00:50.685 --> 00:00:53.005
the routing configuration for that link.

00:00:53.245 --> 00:00:53.645
So

00:00:54.045 --> 00:00:57.245
what we can do here is we can import that link,

00:00:57.775 --> 00:00:58.975
that get link call.

00:00:59.055 --> 00:01:01.375
So see if it will auto import for us.

00:01:01.375 --> 00:01:02.015
So const

00:01:03.135 --> 00:01:06.495
link info from DB is what we can call it.

00:01:06.735 --> 00:01:08.375
And we're going to say get link.

00:01:08.375 --> 00:01:10.895
So that's going to be coming from our repo Data

00:01:10.895 --> 00:01:11.935
Ops package

00:01:12.255 --> 00:01:12.545
and,

00:01:12.775 --> 00:01:15.575
and we're also going to have to make sure that we

00:01:15.835 --> 00:01:17.435
collect our id.

00:01:17.675 --> 00:01:18.635
So with Hono,

00:01:19.035 --> 00:01:22.155
what we can do is we can basically say the context

00:01:22.155 --> 00:01:23.595
request param.

00:01:23.595 --> 00:01:26.195
So this is one of those methods that HONO gives us

00:01:26.195 --> 00:01:27.915
that makes accessing like

00:01:28.725 --> 00:01:30.245
the context of our request

00:01:30.565 --> 00:01:33.605
or like the headers or the actual path variables

00:01:33.605 --> 00:01:35.965
or search parameters or even the payload for a

00:01:35.965 --> 00:01:36.565
post request,

00:01:36.565 --> 00:01:38.725
all that stuff instead of like having a whole

00:01:38.725 --> 00:01:39.205
bunch of

00:01:39.685 --> 00:01:41.725
manual parsing and just making sure everything's

00:01:41.725 --> 00:01:42.485
of the right type.

00:01:42.485 --> 00:01:44.525
HONU does a really good job at kind of inferring

00:01:44.525 --> 00:01:45.325
types for us.

00:01:45.325 --> 00:01:48.405
So it knows this route always needs an id

00:01:48.805 --> 00:01:49.205
and

00:01:49.295 --> 00:01:51.915
it always knows that obviously a path parameter

00:01:51.915 --> 00:01:52.875
has to be a string.

00:01:52.875 --> 00:01:56.835
So ID here is a type safe string type and it

00:01:56.835 --> 00:01:58.035
should always be defined.

00:01:58.195 --> 00:01:58.595
So

00:01:58.702 --> 00:02:00.796
we can go ahead and pass the ID into the

00:02:01.306 --> 00:02:01.936
get link

00:02:02.976 --> 00:02:06.576
into the get link method that calls our database

00:02:06.736 --> 00:02:06.996
and,

00:02:07.146 --> 00:02:09.346
and then inside of this JSON object for now we'll

00:02:09.346 --> 00:02:11.946
just make sure we're able to properly return

00:02:12.506 --> 00:02:14.186
link info from database.

00:02:14.186 --> 00:02:15.506
So when we run this,

00:02:15.506 --> 00:02:17.386
because this is a nonsensical link,

00:02:17.386 --> 00:02:19.626
we'll get an empty object here

00:02:19.946 --> 00:02:20.706
which is totally.

00:02:20.706 --> 00:02:21.226
Okay,

00:02:21.226 --> 00:02:22.426
I'm gonna pull my,

00:02:22.586 --> 00:02:24.106
pull this over just a little bit.

00:02:24.446 --> 00:02:26.296
but if you head to your SmartLink application,

00:02:26.296 --> 00:02:28.736
hopefully you've already created a link and we

00:02:28.736 --> 00:02:29.496
have this link,

00:02:29.496 --> 00:02:30.136
all of these

00:02:30.136 --> 00:02:32.946
different URLs so you can copy One of those,

00:02:32.946 --> 00:02:34.226
this link shouldn't work.

00:02:34.306 --> 00:02:37.226
But the thing that you care about right now is you

00:02:37.226 --> 00:02:37.746
can grab,

00:02:38.626 --> 00:02:40.346
the tail end of this path,

00:02:40.346 --> 00:02:41.986
which is the actual link id,

00:02:42.056 --> 00:02:42.886
head back over here,

00:02:42.886 --> 00:02:46.246
put the link ID at the end of the path parameter,

00:02:46.726 --> 00:02:48.886
and what you're going to notice is we also don't

00:02:48.886 --> 00:02:49.526
get any data.

00:02:49.606 --> 00:02:50.486
Now why is that?

00:02:50.576 --> 00:02:51.666
this is kind of where

00:02:52.146 --> 00:02:55.106
the specific worker configuration comes into play.

00:02:55.296 --> 00:02:58.006
so if you head over to the Wrangler JSON

00:02:58.326 --> 00:02:59.174
C file,

00:02:59.926 --> 00:03:01.486
what you're going to notice is we haven't

00:03:01.486 --> 00:03:02.566
configured our database.

00:03:02.646 --> 00:03:03.046
So,

00:03:03.236 --> 00:03:05.266
at this point let's go ahead and follow the exact

00:03:05.266 --> 00:03:05.906
same path

00:03:06.196 --> 00:03:06.436
that

00:03:06.896 --> 00:03:09.616
took for our user application and configure a

00:03:09.616 --> 00:03:10.136
database.

00:03:10.136 --> 00:03:10.376
Now,

00:03:10.376 --> 00:03:12.056
I would say just pause this video and see if you

00:03:12.056 --> 00:03:12.896
can't do it on your own,

00:03:12.896 --> 00:03:14.936
just to kind of solidify that skill.

00:03:15.496 --> 00:03:15.896
but

00:03:16.296 --> 00:03:18.216
what I'll do is I'll go through that process right

00:03:18.216 --> 00:03:18.536
now.

00:03:18.616 --> 00:03:21.296
So we're going to say D1 databases and then we're

00:03:21.296 --> 00:03:22.856
going to make sure we have that type.

00:03:22.856 --> 00:03:25.456
Instead of me trying to look into the Cloudflare

00:03:25.456 --> 00:03:25.736
environment,

00:03:26.136 --> 00:03:28.776
I'm just going to head over to the Wrangler,

00:03:29.436 --> 00:03:31.116
configuration for our user application

00:03:31.486 --> 00:03:32.926
and I'm going to copy that stuff over.

00:03:33.406 --> 00:03:33.685
So

00:03:33.685 --> 00:03:34.884
copy that information over.

00:03:35.025 --> 00:03:35.425
And

00:03:35.815 --> 00:03:37.675
you can see that we're pulling this database id,

00:03:37.755 --> 00:03:39.435
we're calling this binding db.

00:03:39.995 --> 00:03:41.595
And most importantly,

00:03:41.805 --> 00:03:44.795
for the local setup is we have our experimental

00:03:44.795 --> 00:03:45.875
remote set to true.

00:03:45.875 --> 00:03:47.515
This means we're actually going to be able to

00:03:47.515 --> 00:03:48.395
connect to our

00:03:48.795 --> 00:03:51.115
database that is managed by Cloudflare and it's

00:03:51.115 --> 00:03:53.675
not going to pull from like a local SQLite file

00:03:53.755 --> 00:03:55.835
running inside of our repository here.

00:03:55.995 --> 00:03:56.395
So,

00:03:56.605 --> 00:03:57.715
we have that guy running.

00:03:58.165 --> 00:04:02.005
So let's go ahead and say PNPM run CF type jit

00:04:02.725 --> 00:04:04.245
same exact process as before.

00:04:04.485 --> 00:04:04.885
So,

00:04:05.785 --> 00:04:06.825
this inside of our

00:04:07.575 --> 00:04:08.975
Wrangler configuration,

00:04:08.975 --> 00:04:12.135
you can see we have a D1 database type and

00:04:12.375 --> 00:04:13.975
for the purpose of this project and we'll go a

00:04:13.975 --> 00:04:15.775
little bit deeper into why later in the course,

00:04:15.775 --> 00:04:17.735
but I actually have a second

00:04:18.555 --> 00:04:21.595
binding setup where I extend the Cloudflare's EMV

00:04:21.595 --> 00:04:22.315
with my own.

00:04:22.395 --> 00:04:23.685
And we're going to like,

00:04:23.685 --> 00:04:25.125
there's a really good reason for this,

00:04:25.125 --> 00:04:27.845
but we're not going to dive too deep as to why

00:04:27.845 --> 00:04:28.485
that's the case.

00:04:28.485 --> 00:04:28.845
But

00:04:29.325 --> 00:04:31.245
if we head back over to our app TS,

00:04:31.325 --> 00:04:32.125
you're going to see

00:04:32.445 --> 00:04:34.445
C EMV DB

00:04:34.765 --> 00:04:36.525
will give us access to our

00:04:36.915 --> 00:04:37.885
D1 database.

00:04:37.965 --> 00:04:38.365
Now,

00:04:38.605 --> 00:04:39.845
the D1 database,

00:04:39.845 --> 00:04:41.965
it just gives us access to run these raw queries,

00:04:42.205 --> 00:04:44.405
and we want to make sure that this guy works.

00:04:44.405 --> 00:04:44.725
Now,

00:04:44.725 --> 00:04:45.565
spoiler alert,

00:04:45.645 --> 00:04:47.405
this code is going to fail.

00:04:47.405 --> 00:04:48.005
So if we say,

00:04:48.005 --> 00:04:48.725
pnpm,

00:04:48.725 --> 00:04:49.985
run device,

00:04:50.375 --> 00:04:51.695
go ahead and hit this endpoint,

00:04:51.695 --> 00:04:54.175
we should get a 500 or we should see some error

00:04:54.175 --> 00:04:55.015
outs here.

00:04:56.129 --> 00:04:57.489
make sure that stuff is saved.

00:04:57.541 --> 00:04:59.578
And it looks like we're currently not getting an

00:04:59.578 --> 00:04:59.938
error.

00:04:59.938 --> 00:05:02.298
And the reason why is because we are actually not

00:05:02.298 --> 00:05:03.698
awaiting get link.

00:05:03.778 --> 00:05:05.938
So this request is happening after

00:05:06.888 --> 00:05:08.568
after we are responding.

00:05:08.808 --> 00:05:10.168
So what we're going to do is we're going to make

00:05:10.168 --> 00:05:10.958
sure we await,

00:05:10.958 --> 00:05:12.648
because this is an asynchronous call

00:05:13.128 --> 00:05:15.328
and when we hit this we should get an internal

00:05:15.328 --> 00:05:15.968
server error.

00:05:15.968 --> 00:05:16.408
There we go.

00:05:16.408 --> 00:05:18.368
So this is kind of what the behavior that you

00:05:18.368 --> 00:05:18.808
would expect.

00:05:19.228 --> 00:05:21.068
if you dig into these error logs,

00:05:21.068 --> 00:05:22.588
what you're going to notice is we have this

00:05:22.588 --> 00:05:24.188
database not initialized.

00:05:24.188 --> 00:05:27.148
So if you remember from earlier on in the course

00:05:27.148 --> 00:05:28.908
when we were setting up the user application,

00:05:29.548 --> 00:05:30.668
we have our

00:05:30.988 --> 00:05:32.268
data ops package

00:05:33.148 --> 00:05:34.588
which has a

00:05:35.138 --> 00:05:36.708
database initializer here.

00:05:36.788 --> 00:05:38.988
And this has to be called when we've,

00:05:38.988 --> 00:05:39.348
for the,

00:05:39.348 --> 00:05:41.428
for the very first time when we set up our project

00:05:41.428 --> 00:05:43.108
and when the worker is invoked.

00:05:43.188 --> 00:05:43.588
So

00:05:43.998 --> 00:05:46.908
if we head back over to our index file inside of

00:05:46.908 --> 00:05:47.668
our data service,

00:05:47.908 --> 00:05:50.548
what we're going to do is we are going to create a

00:05:50.548 --> 00:05:51.268
constructor.

00:05:51.828 --> 00:05:53.028
Now the constructor,

00:05:53.428 --> 00:05:54.468
this is just basic,

00:05:55.678 --> 00:05:57.908
object oriented programming convention here.

00:05:57.908 --> 00:06:00.588
So the constructor is going to be invoked when the

00:06:00.588 --> 00:06:02.468
class is instantiated for the first time,

00:06:02.468 --> 00:06:04.508
meaning when this worker is triggered,

00:06:04.508 --> 00:06:05.988
whether it be through a fetch handler

00:06:06.308 --> 00:06:09.228
or from a queue or a schedule or whatever it may

00:06:09.228 --> 00:06:09.468
be,

00:06:09.468 --> 00:06:10.948
whenever this worker is triggered,

00:06:11.498 --> 00:06:13.258
this chunk of code is going to execute.

00:06:13.258 --> 00:06:14.298
And you can see that

00:06:14.318 --> 00:06:15.558
passed into the constructor of

00:06:15.558 --> 00:06:18.198
this worker entry point is the execution context

00:06:18.198 --> 00:06:19.798
and is also the environment,

00:06:20.338 --> 00:06:22.258
so the bindings that we have access to.

00:06:22.258 --> 00:06:24.738
So what I'm going to do is I'm going to say so

00:06:24.738 --> 00:06:25.058
super.

00:06:25.297 --> 00:06:27.418
So this is something that you have to specify

00:06:27.418 --> 00:06:28.418
whenever you are

00:06:29.018 --> 00:06:31.338
working inside of a constructor to make sure that

00:06:31.338 --> 00:06:33.818
the class is going to have the exact same behavior

00:06:33.898 --> 00:06:36.858
you pass in the original properties,

00:06:36.958 --> 00:06:37.898
into the super method.

00:06:37.898 --> 00:06:39.218
And then what we're going to do is we're going to

00:06:39.218 --> 00:06:39.938
say initial

00:06:40.248 --> 00:06:43.168
database and we're going to say EMV DB.

00:06:43.168 --> 00:06:45.528
So we're going to pass in that D1 SQL database.

00:06:45.608 --> 00:06:47.128
Now when we load this guy

00:06:47.528 --> 00:06:48.808
we should get our data.

00:06:48.808 --> 00:06:49.328
And there we go,

00:06:49.328 --> 00:06:50.008
we got our data.

00:06:50.168 --> 00:06:52.008
So now this is the intended behavior

00:06:52.058 --> 00:06:53.448
that we would expect to see because

00:06:53.768 --> 00:06:55.528
our database was initialized

00:06:56.008 --> 00:06:57.288
when we received the request.

00:06:57.288 --> 00:06:59.488
And before processing that request everything is

00:06:59.488 --> 00:07:03.008
set up and we are able to call our helper methods

00:07:03.008 --> 00:07:04.488
that interact with our database.

00:07:04.488 --> 00:07:04.888
So

00:07:05.018 --> 00:07:06.748
this is a really clean design in my opinion,

00:07:06.748 --> 00:07:09.028
because all of our queries are kind of isolated in

00:07:09.028 --> 00:07:10.508
their own section they're reusable.

00:07:10.578 --> 00:07:12.688
we're able to use this on the front end and we're

00:07:12.688 --> 00:07:14.328
able to use this deeper in the back end for

00:07:14.328 --> 00:07:15.008
certain operations.

00:07:15.008 --> 00:07:16.006
This get link call

00:07:16.006 --> 00:07:17.716
and from here we return,

00:07:18.326 --> 00:07:19.686
link info from db.

00:07:19.846 --> 00:07:21.366
So this is how we

00:07:21.686 --> 00:07:22.256
set up,

00:07:22.346 --> 00:07:26.066
the basic database configuration for our backend

00:07:26.066 --> 00:07:26.586
application.

00:07:26.586 --> 00:07:27.466
And it's going to be,

00:07:27.866 --> 00:07:30.546
it's going to basically be what drives all of the

00:07:30.546 --> 00:07:31.546
logic going forward,

00:07:32.186 --> 00:07:33.666
are the interactions that we have with our

00:07:33.666 --> 00:07:34.426
database here.

00:07:34.506 --> 00:07:34.906
So,

00:07:35.146 --> 00:07:38.146
just remember that this isn't necessarily a SQL or

00:07:38.146 --> 00:07:40.116
a DB D1 database convention.

00:07:40.456 --> 00:07:42.856
I follow this pattern when I set up really any

00:07:44.056 --> 00:07:46.136
serverless database with Cloudflare workers.

00:07:46.514 --> 00:07:46.914
All right,

00:07:46.914 --> 00:07:48.474
so coming up in this next video,

00:07:48.474 --> 00:07:50.314
we're actually going to get into the meat of

00:07:50.314 --> 00:07:52.154
building out the routing logic.

00:07:52.154 --> 00:07:54.354
So we're going to be looking at the Cloudflare,

00:07:54.864 --> 00:07:56.054
specific tag properties,

00:07:56.134 --> 00:07:57.334
determining where the user is,

00:07:57.334 --> 00:08:00.334
and then we're going to route them to the desired

00:08:00.334 --> 00:08:02.294
destination link instead of just returning this

00:08:02.294 --> 00:08:03.254
JSON object

00:08:03.814 --> 00:08:06.694
based upon the data that we get back from our

00:08:06.694 --> 00:08:07.574
database call.

