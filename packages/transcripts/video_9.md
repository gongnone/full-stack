WEBVTT
X-TIMESTAMP-MAP=LOCAL:00:00:00.000,MPEGTS:900000

00:00:00.098 --> 00:00:00.578
All right,

00:00:00.578 --> 00:00:02.618
so now that we have our database created,

00:00:02.618 --> 00:00:05.218
we have created our tables and we've pulled those

00:00:05.218 --> 00:00:07.498
table schemas into our project that are,

00:00:07.498 --> 00:00:09.778
and they're represented as typescript objects.

00:00:10.018 --> 00:00:11.857
Let's now go through the process of actually

00:00:11.857 --> 00:00:14.498
building out a query that's going to create and

00:00:14.578 --> 00:00:15.698
save link information.

00:00:16.178 --> 00:00:19.098
So what I'm going to do here is I'm actually going

00:00:19.098 --> 00:00:19.458
to

00:00:19.778 --> 00:00:21.298
navigate over to

00:00:21.628 --> 00:00:23.698
the app that the user application within the

00:00:23.698 --> 00:00:23.938
project.

00:00:24.178 --> 00:00:25.738
I just want to be able to kind of split these

00:00:25.738 --> 00:00:27.778
applications up so we're able to

00:00:28.098 --> 00:00:30.338
navigate and kind of see what's going on easier.

00:00:30.418 --> 00:00:31.538
But you don't have to do this.

00:00:31.538 --> 00:00:33.298
You can work within this Mono repo.

00:00:33.298 --> 00:00:36.698
But for me I'm just going to CD into the apps and

00:00:36.698 --> 00:00:37.778
the user application

00:00:38.098 --> 00:00:38.817
and then

00:00:39.814 --> 00:00:41.094
I'm going to open up

00:00:41.124 --> 00:00:42.861
the user application as its own,

00:00:42.868 --> 00:00:44.448
as its own project here.

00:00:44.448 --> 00:00:46.488
So this is going to be a little bit easier for you

00:00:46.488 --> 00:00:47.648
guys to see what's going on.

00:00:47.648 --> 00:00:48.048
So

00:00:48.328 --> 00:00:48.848
I'll do that.

00:00:48.848 --> 00:00:50.648
I'm going to open up a new terminal in here

00:00:50.758 --> 00:00:53.846
and then I'm going to say pnpm run dev and I'm

00:00:53.846 --> 00:00:55.646
going to zoom in quite a bit so you guys can

00:00:55.646 --> 00:00:55.926
actually

00:00:56.486 --> 00:00:58.166
see more clearly what's going on.

00:00:58.966 --> 00:01:01.946
But now we have our application running up,

00:01:01.946 --> 00:01:02.784
we'll head on over

00:01:03.026 --> 00:01:05.746
and what we're going to do is we're going to start

00:01:05.746 --> 00:01:07.826
the process of actually building out the

00:01:08.036 --> 00:01:08.947
Create Link

00:01:09.374 --> 00:01:09.814
logic.

00:01:09.814 --> 00:01:11.654
So if you head over to this Create Link button,

00:01:11.654 --> 00:01:13.734
you're going to see that essentially what we need

00:01:13.734 --> 00:01:16.174
to do is we need to specify some type of name so

00:01:16.174 --> 00:01:16.974
we can say like

00:01:17.994 --> 00:01:18.714
random

00:01:19.114 --> 00:01:19.514
product

00:01:20.154 --> 00:01:22.394
and then we're going to give it a link and that's

00:01:22.394 --> 00:01:24.033
the link that is going to be routed to when

00:01:24.033 --> 00:01:24.914
somebody clicks on it.

00:01:24.914 --> 00:01:25.914
And then when we hit Create

00:01:26.234 --> 00:01:28.154
it should create it and then bring us to this

00:01:28.154 --> 00:01:28.714
dashboard.

00:01:28.714 --> 00:01:30.394
Now obviously this is just kind of dummy data

00:01:30.394 --> 00:01:30.874
right now,

00:01:31.194 --> 00:01:33.274
but what we're going to do is we're actually going

00:01:33.274 --> 00:01:34.274
to build out that logic.

00:01:34.274 --> 00:01:36.074
So we can go to the Create Link thing,

00:01:36.644 --> 00:01:39.124
slide over to the user application and then let's

00:01:39.124 --> 00:01:39.884
go into the routes.

00:01:39.884 --> 00:01:41.844
So in the routes inside of our app

00:01:41.854 --> 00:01:42.680
we will go to auth,

00:01:42.840 --> 00:01:44.920
and then there's this Create tsx,

00:01:44.920 --> 00:01:46.360
so this is the Create page.

00:01:46.760 --> 00:01:49.120
And then what we're going to notice here is we

00:01:49.120 --> 00:01:50.120
have a mutation.

00:01:50.440 --> 00:01:52.680
And that mutation is the

00:01:52.950 --> 00:01:55.940
function that actually calls the server side code

00:01:56.020 --> 00:01:57.300
to save the link information.

00:01:57.780 --> 00:02:00.340
And what happens here is if we can go find Create.

00:02:01.100 --> 00:02:03.420
Create mutation is There's a button

00:02:03.740 --> 00:02:06.420
that is basically the Create button that calls

00:02:06.420 --> 00:02:07.100
this mutation.

00:02:07.180 --> 00:02:09.620
And then when it calls that mutation and it's

00:02:09.620 --> 00:02:10.700
successfully resolved,

00:02:11.260 --> 00:02:11.900
it will,

00:02:12.260 --> 00:02:15.940
it'll navigate to the specific link page.

00:02:16.340 --> 00:02:18.460
So what we're going to want to do is we're going

00:02:18.460 --> 00:02:20.340
to want to actually build out what's on the back

00:02:20.340 --> 00:02:20.900
end here.

00:02:20.980 --> 00:02:22.694
So if we go to our mutation,

00:02:22.776 --> 00:02:24.336
we can right click on it,

00:02:24.336 --> 00:02:24.866
or we can,

00:02:25.016 --> 00:02:27.376
can command click on it and we can drill into the

00:02:27.376 --> 00:02:27.816
actual,

00:02:27.986 --> 00:02:28.756
worker code.

00:02:28.996 --> 00:02:30.396
Or if you don't do that,

00:02:30.396 --> 00:02:32.836
what you can do is you can go to.

00:02:33.156 --> 00:02:34.356
So if you look at the source,

00:02:34.356 --> 00:02:35.456
you can head over to Worker,

00:02:35.456 --> 00:02:36.296
go to the routes,

00:02:37.016 --> 00:02:38.376
go to the links,

00:02:38.376 --> 00:02:39.016
and I'm going to go,

00:02:39.216 --> 00:02:39.972
to the links.

00:02:39.972 --> 00:02:42.994
And then you'll see we have this specific

00:02:43.314 --> 00:02:44.034
mutation

00:02:44.514 --> 00:02:45.954
that says Create Link.

00:02:46.434 --> 00:02:48.594
Now there's also a input schema.

00:02:48.594 --> 00:02:48.764
And,

00:02:48.834 --> 00:02:50.274
and I don't want to touch too deep on this,

00:02:50.274 --> 00:02:53.154
but basically we're using a library called Zod to

00:02:53.314 --> 00:02:55.154
define what that input looks like.

00:02:55.154 --> 00:02:57.194
And then it does validation and throws errors if

00:02:57.194 --> 00:02:58.194
it's not of that type.

00:02:58.614 --> 00:03:00.114
this is actually defined

00:03:00.434 --> 00:03:02.594
inside of our Data Ops

00:03:02.694 --> 00:03:04.454
package within our monorepo.

00:03:04.534 --> 00:03:05.814
So what we're going to do is we're going to go

00:03:05.814 --> 00:03:07.334
over to that Data Ops package,

00:03:07.494 --> 00:03:09.894
we're going to go look for this Create Link schema

00:03:09.894 --> 00:03:10.934
just so you can see what it is.

00:03:11.254 --> 00:03:13.454
And then what we're going to do is we're actually

00:03:13.454 --> 00:03:14.694
going to build out the logic

00:03:14.744 --> 00:03:15.304
to say

00:03:15.944 --> 00:03:19.624
to take the input data and then save it inside of

00:03:19.624 --> 00:03:20.424
our database.

00:03:20.504 --> 00:03:24.064
So let's head over to our Data Ops package.

00:03:24.064 --> 00:03:25.628
What we're going to do is we're first going to

00:03:25.628 --> 00:03:26.668
look under Source.

00:03:26.740 --> 00:03:27.600
We can go to Zod,

00:03:27.920 --> 00:03:29.000
we can go to Links,

00:03:29.000 --> 00:03:30.480
and then you can see what this

00:03:30.530 --> 00:03:31.400
schema looks like.

00:03:31.800 --> 00:03:32.200
So

00:03:32.470 --> 00:03:34.705
a link schema is basically taking this.

00:03:34.705 --> 00:03:35.745
So it's basically taking

00:03:36.145 --> 00:03:36.405
this,

00:03:36.555 --> 00:03:36.795
this,

00:03:36.935 --> 00:03:38.455
object as the input.

00:03:38.755 --> 00:03:40.135
it takes a link id,

00:03:40.135 --> 00:03:41.351
it takes an account id,

00:03:41.351 --> 00:03:43.991
which this is going to come into play when we are

00:03:44.071 --> 00:03:45.951
actually integrating authentication into our

00:03:45.951 --> 00:03:46.471
application.

00:03:46.711 --> 00:03:47.151
For now,

00:03:47.151 --> 00:03:48.711
this will just kind of be dummy data.

00:03:49.371 --> 00:03:50.051
it takes a name,

00:03:50.051 --> 00:03:51.851
as you saw from this input,

00:03:52.251 --> 00:03:53.371
it takes destination,

00:03:54.091 --> 00:03:54.131
takes

00:03:54.351 --> 00:03:55.151
destinations,

00:03:55.391 --> 00:03:56.591
which is another

00:03:57.231 --> 00:03:58.151
Zod object,

00:03:58.151 --> 00:03:59.391
which is basically a

00:04:00.306 --> 00:04:02.666
which is basically just like an object of a key

00:04:02.666 --> 00:04:03.280
value pair.

00:04:03.280 --> 00:04:06.078
And then what we're doing is we are wiring it and

00:04:06.078 --> 00:04:08.038
we're basically pointing it as the input.

00:04:08.118 --> 00:04:10.438
So this is the specific type of data that we

00:04:10.678 --> 00:04:12.409
expect to be sent from the UI

00:04:12.426 --> 00:04:14.066
and to actually create the Query.

00:04:14.066 --> 00:04:16.266
What we can do is we can head over to our

00:04:16.676 --> 00:04:18.076
what we're going to do is we're actually probably

00:04:18.076 --> 00:04:19.596
going to create a new folder here.

00:04:19.596 --> 00:04:19.956
So

00:04:20.526 --> 00:04:22.135
going to create a new folder under Source

00:04:22.135 --> 00:04:23.719
and it's going to be called Queries.

00:04:25.959 --> 00:04:28.999
And inside of that folder I will create a new file

00:04:29.079 --> 00:04:31.399
and we'll call this Links ts.

00:04:32.352 --> 00:04:32.752
so

00:04:33.054 --> 00:04:34.014
Links ts.

00:04:34.174 --> 00:04:35.854
What we are going to want to do is we're going to

00:04:35.854 --> 00:04:36.574
want to actually

00:04:37.804 --> 00:04:38.684
create this

00:04:39.204 --> 00:04:39.604
Create

00:04:40.164 --> 00:04:43.324
link query that inserts the data into our

00:04:43.324 --> 00:04:43.724
database.

00:04:43.724 --> 00:04:44.724
So we can say export

00:04:47.768 --> 00:04:48.328
function,

00:04:48.488 --> 00:04:49.340
Create link

00:04:51.084 --> 00:04:52.684
and what we're going to actually do is we're going

00:04:52.684 --> 00:04:54.106
to make this async.

00:04:58.495 --> 00:05:00.895
Now this create link is going to take in some data

00:05:01.295 --> 00:05:04.255
and that data is going to be of the type Create

00:05:04.255 --> 00:05:06.575
link that we have defined inside of our Zod

00:05:06.575 --> 00:05:07.135
schemas.

00:05:07.215 --> 00:05:07.449
So

00:05:07.449 --> 00:05:08.941
what we can do is we can look here.

00:05:12.976 --> 00:05:13.456
All right,

00:05:13.536 --> 00:05:14.816
so we have this

00:05:15.136 --> 00:05:15.936
name we have,

00:05:15.936 --> 00:05:19.136
we have this type which is the Create link schema

00:05:19.136 --> 00:05:19.576
type.

00:05:19.576 --> 00:05:21.096
And I'm going to just make sure that that is

00:05:21.096 --> 00:05:23.296
imported and we can actually go to that file and

00:05:23.296 --> 00:05:23.736
you can see.

00:05:23.736 --> 00:05:25.696
So basically what we're saying is we have this

00:05:25.756 --> 00:05:28.556
Create links odd schema and what we're going to do

00:05:28.556 --> 00:05:29.636
is we are going to,

00:05:29.716 --> 00:05:31.276
we export the type of that.

00:05:31.276 --> 00:05:34.756
So we have a Zod infer type of and we have the

00:05:34.916 --> 00:05:36.276
Create link type schema.

00:05:36.276 --> 00:05:37.396
So this just makes our

00:05:37.616 --> 00:05:39.576
code very type safe and it also helps with like

00:05:39.576 --> 00:05:40.256
autocomplete.

00:05:40.256 --> 00:05:42.436
AI is able to understand and complet stuff faster

00:05:42.436 --> 00:05:42.596
too,

00:05:42.596 --> 00:05:43.396
which is really nice.

00:05:43.396 --> 00:05:45.836
So what we're doing is we're going to say the data

00:05:45.836 --> 00:05:47.756
that gets passed into has to be of the shape

00:05:47.756 --> 00:05:48.556
create link.

00:05:48.956 --> 00:05:52.476
And additionally it needs an account ID because on

00:05:52.476 --> 00:05:54.876
this type we are actually omitting

00:05:55.076 --> 00:05:57.266
the account ID because this is going to be

00:05:58.146 --> 00:06:00.506
in by our TRPC route and I'll show you what that's

00:06:00.506 --> 00:06:01.146
going to look like.

00:06:01.306 --> 00:06:01.706
So

00:06:02.187 --> 00:06:03.608
if we head back to this function,

00:06:03.608 --> 00:06:05.368
what we can do is we're going to first say like

00:06:05.368 --> 00:06:06.368
let's get our database.

00:06:06.448 --> 00:06:09.428
So we're going to say const and DB equals

00:06:10.038 --> 00:06:11.068
get db.

00:06:12.268 --> 00:06:14.388
And you might be wondering where is get DB come

00:06:14.388 --> 00:06:14.548
from.

00:06:14.548 --> 00:06:15.708
This is kind of what I want to touch on.

00:06:15.708 --> 00:06:16.668
This is the first step

00:06:16.818 --> 00:06:19.458
of the process that I kind of take when building

00:06:19.458 --> 00:06:23.178
out a monorepo is I create a getter and a setter

00:06:23.178 --> 00:06:24.058
for the database.

00:06:24.058 --> 00:06:25.392
So if we head over to this file,

00:06:25.392 --> 00:06:27.433
it's going to be in database TS

00:06:27.753 --> 00:06:29.273
what we're going to see is there's this very

00:06:29.273 --> 00:06:31.833
simple logic where we are implementing or we're

00:06:31.833 --> 00:06:33.573
importing drizzle from the

00:06:33.663 --> 00:06:34.864
D1 package of drizzle.

00:06:34.864 --> 00:06:36.909
Then what we're basically saying is we're defining

00:06:36.909 --> 00:06:38.869
a database or a DB

00:06:39.349 --> 00:06:41.529
that has the return type of drizzle

00:06:41.561 --> 00:06:43.761
and then we have this function and this function

00:06:43.761 --> 00:06:44.041
is

00:06:44.311 --> 00:06:45.301
init database,

00:06:45.301 --> 00:06:48.821
which takes in a D1 database and then it sets this

00:06:49.061 --> 00:06:49.710
globally.

00:06:49.710 --> 00:06:52.100
Now what we're able to do is when the application

00:06:52.100 --> 00:06:54.900
runs and it starts up and we get a request,

00:06:55.370 --> 00:06:56.770
the very first thing that we're going to do when

00:06:56.770 --> 00:06:58.570
we get a request is we're going to call this

00:06:58.570 --> 00:06:59.050
method

00:06:59.370 --> 00:07:01.850
init database and then that's going to set this

00:07:01.850 --> 00:07:05.210
database so we can use it throughout the rest of

00:07:05.210 --> 00:07:06.570
the lifecycle of a request.

00:07:06.730 --> 00:07:08.490
And then what happens here is we're able to kind

00:07:08.490 --> 00:07:09.770
of abstract away the

00:07:10.230 --> 00:07:11.630
getting and the creating of

00:07:12.150 --> 00:07:13.990
queries within our application code.

00:07:13.990 --> 00:07:15.910
And it's all going to be pushed into this package.

00:07:16.070 --> 00:07:16.470
So

00:07:17.370 --> 00:07:19.770
from there we export this function called get db

00:07:20.020 --> 00:07:21.740
which is literally just trying to get this DB

00:07:21.740 --> 00:07:22.260
right here.

00:07:22.740 --> 00:07:25.500
And if that DB hasn't been instantiated so we

00:07:25.500 --> 00:07:26.180
don't call this

00:07:26.920 --> 00:07:29.000
if we don't call this when we first get a request

00:07:29.160 --> 00:07:30.160
we're going to see this error.

00:07:30.160 --> 00:07:31.960
And if we see this error we know exactly what went

00:07:31.960 --> 00:07:32.320
wrong

00:07:32.420 --> 00:07:33.940
we'll just make sure we have it instantiated.

00:07:33.940 --> 00:07:35.459
So this is kind of like a one time setup thing

00:07:35.459 --> 00:07:37.420
that we do when we're building out a new

00:07:37.720 --> 00:07:39.126
service or application.

00:07:39.126 --> 00:07:40.460
So let's head back to our queries

00:07:40.528 --> 00:07:41.434
and we're going to

00:07:41.754 --> 00:07:42.674
write this query.

00:07:42.674 --> 00:07:44.874
So a few things that I'm going to do here like I'm

00:07:44.874 --> 00:07:45.914
going to create a

00:07:47.294 --> 00:07:49.054
ID which is going to be used,

00:07:50.334 --> 00:07:52.314
which is going to be used or passed in

00:07:52.314 --> 00:07:53.714
as like the actual link id.

00:07:53.874 --> 00:07:55.794
And a nano ID is like a good,

00:07:55.794 --> 00:07:57.794
but it's much smaller just because I don't want

00:07:57.794 --> 00:07:58.914
these links to be too long,

00:07:59.124 --> 00:08:00.634
because it's kind of like a short link system.

00:08:01.034 --> 00:08:03.074
And then what we're going to do is we're going to

00:08:03.074 --> 00:08:03.354
say

00:08:03.674 --> 00:08:05.434
await db.insvert

00:08:06.314 --> 00:08:08.634
and then we're going to pass in the links table.

00:08:08.634 --> 00:08:09.834
So this links table

00:08:10.234 --> 00:08:10.874
should be

00:08:11.974 --> 00:08:15.014
it'll be imported from the schemas that were

00:08:15.014 --> 00:08:16.134
generated by

00:08:16.534 --> 00:08:16.934
the

00:08:17.334 --> 00:08:18.414
Drizzle Kit command.

00:08:18.414 --> 00:08:20.358
When we said npm run pull

00:08:20.358 --> 00:08:22.514
so we're able to pull this actual link schema.

00:08:22.514 --> 00:08:24.351
This was auto generated by that command

00:08:24.351 --> 00:08:25.573
and then we're going to go ahead and finish

00:08:25.573 --> 00:08:27.054
writing this query where we insert

00:08:28.344 --> 00:08:29.144
values.

00:08:33.224 --> 00:08:34.744
And I'm just going to go ahead and copy some of

00:08:34.744 --> 00:08:35.394
this stuff.

00:08:35.394 --> 00:08:35.629
So

00:08:36.676 --> 00:08:37.876
we're going to Pass in the ID

00:08:37.969 --> 00:08:38.864
the account name,

00:08:38.864 --> 00:08:41.189
so data.account name which is defined here.

00:08:41.869 --> 00:08:45.629
then we're going to pass in the data name which is

00:08:45.629 --> 00:08:46.565
passed in from here,

00:08:46.565 --> 00:08:49.857
and we're going to JSON our Stringify the

00:08:49.857 --> 00:08:51.217
destinations object.

00:08:51.217 --> 00:08:53.017
So we're going to store all the destinations that

00:08:53.017 --> 00:08:54.430
the links could possibly route to.

00:08:54.432 --> 00:08:54.832
And

00:08:55.152 --> 00:08:57.072
that is literally all that we need to do here.

00:08:57.072 --> 00:08:58.712
The only last thing that I want to do is I'm just

00:08:58.712 --> 00:08:59.232
going to return

00:08:59.802 --> 00:09:01.482
the ID that was defined.

00:09:01.642 --> 00:09:03.002
So just to kind of reiterate,

00:09:03.082 --> 00:09:04.202
we have this function,

00:09:04.442 --> 00:09:06.282
and this function is called Create Link.

00:09:06.922 --> 00:09:09.722
this is going to be used inside of our TRPC route.

00:09:10.202 --> 00:09:12.602
We are grabbing our database from a,

00:09:12.762 --> 00:09:14.702
database getter that we've defined within this

00:09:14.702 --> 00:09:15.302
package,

00:09:15.622 --> 00:09:16.662
creating a random id,

00:09:16.902 --> 00:09:19.062
Then we're inserting the data into our database.

00:09:19.222 --> 00:09:19.782
All right,

00:09:20.262 --> 00:09:21.942
so now what we're going to want to do is you're

00:09:21.942 --> 00:09:23.542
going to want to understand exactly how

00:09:24.482 --> 00:09:25.142
we end up,

00:09:25.195 --> 00:09:27.035
how we actually end up building this project so it

00:09:27.035 --> 00:09:28.875
can be used by our application.

00:09:28.955 --> 00:09:31.605
So if you look in our package JSON

00:09:31.605 --> 00:09:33.369
inside of this data ops package,

00:09:33.369 --> 00:09:36.371
we specified the name Repo Data Ops.

00:09:36.371 --> 00:09:37.091
So this is the project,

00:09:37.171 --> 00:09:38.611
or this is like the package name.

00:09:38.931 --> 00:09:41.171
And then we have this export script which if you

00:09:41.171 --> 00:09:42.331
haven't worked in a monorepo,

00:09:42.331 --> 00:09:45.051
you might not be familiar that like pnpm,

00:09:45.051 --> 00:09:47.411
you're able to define an export script.

00:09:47.491 --> 00:09:47.741
And,

00:09:47.891 --> 00:09:49.811
and what this does is this basically says,

00:09:50.181 --> 00:09:53.101
this package should have access to like these

00:09:53.101 --> 00:09:54.181
specific paths.

00:09:54.181 --> 00:09:56.261
So it should be able to import stuff from a

00:09:56.261 --> 00:09:57.381
database path,

00:09:57.621 --> 00:09:59.061
stuff from a queries path,

00:09:59.141 --> 00:09:59.781
which is

00:10:00.181 --> 00:10:01.381
in the same folder

00:10:01.701 --> 00:10:03.861
for where we define this specific query.

00:10:04.271 --> 00:10:05.721
and then basically what we're doing is we're

00:10:05.721 --> 00:10:05.961
saying

00:10:06.281 --> 00:10:09.321
go traverse all of the query files within this

00:10:09.321 --> 00:10:12.841
folder and it's specifying the types when this is

00:10:12.841 --> 00:10:13.241
built

00:10:13.801 --> 00:10:16.201
and it's also specifying where those JS files are.

00:10:16.351 --> 00:10:18.341
we're doing the same for SOD schemas and then a

00:10:18.341 --> 00:10:19.221
few other things in here.

00:10:19.381 --> 00:10:21.541
So this is the configuration for the package of a

00:10:21.541 --> 00:10:22.341
monorepo.

00:10:22.341 --> 00:10:22.901
And then

00:10:23.012 --> 00:10:24.468
what we're going to do is

00:10:24.948 --> 00:10:27.388
you're going to make sure you are in the data ops

00:10:27.388 --> 00:10:30.228
package and then you're going to say pnpm

00:10:31.668 --> 00:10:32.708
run build.

00:10:33.668 --> 00:10:36.228
That's going to build the code and that's going to

00:10:36.228 --> 00:10:38.948
be output into a dist folder and what you're going

00:10:38.948 --> 00:10:40.828
to notice here is in the dist folder we'll have

00:10:40.828 --> 00:10:41.788
the same paths here.

00:10:41.788 --> 00:10:43.708
So like run we will have a dist

00:10:44.268 --> 00:10:46.748
and then we should have a database,

00:10:47.008 --> 00:10:47.888
or a DB

00:10:48.288 --> 00:10:49.088
database

00:10:49.488 --> 00:10:50.008
js.

00:10:50.008 --> 00:10:52.048
So DB database js.

00:10:52.288 --> 00:10:53.248
Same with the queries.

00:10:53.248 --> 00:10:55.568
So we have a queries folder and essentially like

00:10:55.568 --> 00:10:58.318
our code got exported into here in JS format.

00:10:58.318 --> 00:11:00.048
and it also exported those types.

00:11:00.128 --> 00:11:00.458
So

00:11:00.458 --> 00:11:02.828
our TypeScript project or application will be able

00:11:02.828 --> 00:11:04.508
to pick up on those types too.

00:11:05.068 --> 00:11:07.628
So if we now head back over to our,

00:11:08.598 --> 00:11:10.958
if we head back over to our user application and

00:11:10.958 --> 00:11:12.918
then we go to the package JSON file,

00:11:12.918 --> 00:11:15.238
what you're going to notice here is we have a

00:11:15.238 --> 00:11:15.558
project

00:11:16.118 --> 00:11:17.078
defined in here

00:11:17.403 --> 00:11:18.356
called Repo

00:11:18.676 --> 00:11:19.596
DataOps.

00:11:19.596 --> 00:11:20.516
And this is actually.

00:11:20.516 --> 00:11:22.156
So if you look at the version here,

00:11:22.156 --> 00:11:23.956
it's not like a numeric version,

00:11:24.436 --> 00:11:26.156
it's coming from workspace.

00:11:26.156 --> 00:11:27.636
So this is PMPM specific,

00:11:27.636 --> 00:11:29.876
where we basically say this package is going to

00:11:29.876 --> 00:11:30.756
come from workspace.

00:11:30.756 --> 00:11:32.866
So it knows to look at the workspace and,

00:11:32.936 --> 00:11:34.776
and then pull those files from wherever the

00:11:34.776 --> 00:11:36.056
exports have been defined

00:11:36.456 --> 00:11:38.456
inside of this workspace.

00:11:38.696 --> 00:11:39.256
Okay,

00:11:39.496 --> 00:11:39.896
so,

00:11:40.216 --> 00:11:41.176
and now

00:11:41.976 --> 00:11:43.416
what we're going to want to do is we're going to

00:11:43.416 --> 00:11:45.896
want to head back over to our TRPC route

00:11:46.296 --> 00:11:47.176
called Links,

00:11:47.496 --> 00:11:48.536
where we have this,

00:11:49.163 --> 00:11:51.323
where we have this Create link method.

00:11:51.643 --> 00:11:53.603
And then what we're going to do is we're basically

00:11:53.603 --> 00:11:54.203
going to say

00:11:54.843 --> 00:11:57.883
we're going to take the input from trpc

00:11:58.443 --> 00:12:01.163
and you can see that this input is from the input.

00:12:01.163 --> 00:12:02.283
We have the name,

00:12:02.283 --> 00:12:03.563
we have the destinations,

00:12:03.583 --> 00:12:05.443
we have some information that's being sent from

00:12:05.443 --> 00:12:06.003
the ui.

00:12:06.323 --> 00:12:07.923
And then we're going to say await,

00:12:09.813 --> 00:12:11.893
and we're going to call this method and this

00:12:11.893 --> 00:12:12.213
should,

00:12:13.093 --> 00:12:14.453
should be able to import this

00:12:15.093 --> 00:12:15.973
from our

00:12:16.453 --> 00:12:17.333
data ops.

00:12:17.333 --> 00:12:18.933
So we can say from queries,

00:12:20.009 --> 00:12:21.449
forward slash links.

00:12:22.719 --> 00:12:23.119
All right,

00:12:23.199 --> 00:12:25.679
so we have this method Create Links.

00:12:25.919 --> 00:12:27.519
We'll head on over to our code

00:12:27.839 --> 00:12:29.199
on the create link,

00:12:29.879 --> 00:12:31.079
on the Create link

00:12:31.479 --> 00:12:32.999
procedure that we've defined here.

00:12:33.319 --> 00:12:35.319
And then we're just going to simply put

00:12:35.639 --> 00:12:36.759
in this data.

00:12:36.759 --> 00:12:38.039
So we are going to say,

00:12:45.414 --> 00:12:45.894
okay,

00:12:45.894 --> 00:12:47.734
so what we're able to do is.

00:12:47.813 --> 00:12:49.814
So I guess one other thing here,

00:12:50.134 --> 00:12:51.334
we're going to want to also

00:12:52.294 --> 00:12:53.014
expose

00:12:54.214 --> 00:12:55.054
ctx.

00:12:55.054 --> 00:12:56.094
This is the context.

00:12:56.094 --> 00:12:58.454
So with trpc you have,

00:12:58.454 --> 00:13:00.254
if you just basically say like I'm going to take

00:13:00.254 --> 00:13:00.534
data,

00:13:00.854 --> 00:13:02.454
you have a bunch of information here.

00:13:02.794 --> 00:13:03.194
You have

00:13:03.514 --> 00:13:04.954
data dot input.

00:13:05.194 --> 00:13:08.034
This is the input that's defined inside of your

00:13:08.034 --> 00:13:08.714
procedure.

00:13:09.194 --> 00:13:10.794
You also have context

00:13:11.114 --> 00:13:13.314
which has some like attributes related to the

00:13:13.314 --> 00:13:15.194
request and then also additional things that you

00:13:15.194 --> 00:13:15.474
add.

00:13:15.474 --> 00:13:17.194
We're going to go into this in just a little bit.

00:13:18.554 --> 00:13:20.154
so essentially what we're doing here is we're

00:13:20.154 --> 00:13:21.274
saying we just need to grab.

00:13:21.274 --> 00:13:23.754
We just want context and we want input.

00:13:23.754 --> 00:13:25.834
And then the input is the input from the form,

00:13:26.234 --> 00:13:27.514
so we're inputting that here.

00:13:27.834 --> 00:13:30.314
And then the account ID is actually the user ID

00:13:30.554 --> 00:13:32.714
that's going to be provided from our auth

00:13:33.484 --> 00:13:34.044
framework.

00:13:34.204 --> 00:13:36.684
Now what I want to do right now is I want to

00:13:36.703 --> 00:13:37.013
run,

00:13:37.013 --> 00:13:39.333
I want to actually like use the UI and it's going

00:13:39.333 --> 00:13:40.053
to error out.

00:13:40.053 --> 00:13:41.253
And when it errors out,

00:13:41.253 --> 00:13:41.772
try to like,

00:13:41.772 --> 00:13:43.453
think of why it's actually erroring out.

00:13:43.453 --> 00:13:44.467
So we come over here,

00:13:44.467 --> 00:13:45.454
I'm going to inspect,

00:13:45.854 --> 00:13:46.574
go to Network,

00:13:46.700 --> 00:13:48.261
and I'm going to basically give it a fake product

00:13:48.261 --> 00:13:48.621
name,

00:13:50.351 --> 00:13:50.991
product one.

00:13:51.471 --> 00:13:53.831
And we're just going to have like some random

00:13:53.831 --> 00:13:56.431
destination URL and we're going to hit create.

00:13:56.431 --> 00:13:58.431
And what you can see is we have a failed

00:13:58.781 --> 00:13:59.491
Create link.

00:13:59.731 --> 00:14:01.291
We got a 500 here.

00:14:01.291 --> 00:14:03.571
It's going to have kind of some generic like

00:14:03.731 --> 00:14:04.611
internal service

00:14:05.021 --> 00:14:05.371
error.

00:14:05.371 --> 00:14:07.051
And then the error is

00:14:07.451 --> 00:14:09.131
database not initialized.

00:14:09.131 --> 00:14:09.964
So if you remember,

00:14:09.964 --> 00:14:11.044
we created

00:14:11.244 --> 00:14:11.523
our.

00:14:11.523 --> 00:14:13.046
We created our database

00:14:13.215 --> 00:14:15.695
logic where we have to initialize the.

00:14:16.575 --> 00:14:16.585
We,

00:14:16.715 --> 00:14:18.435
have to initialize the database when we first

00:14:18.435 --> 00:14:19.395
receive the request.

00:14:20.035 --> 00:14:21.940
So with our cloudflare worker,

00:14:21.940 --> 00:14:22.890
if we close the stuff.

00:14:22.890 --> 00:14:24.650
So if you come to the worker in our user

00:14:24.650 --> 00:14:25.208
application,

00:14:25.208 --> 00:14:26.043
come to index,

00:14:26.043 --> 00:14:27.963
what you're going to see is we have this very

00:14:28.043 --> 00:14:29.963
generic basic fetch handler

00:14:30.603 --> 00:14:31.843
and we're receiving,

00:14:31.843 --> 00:14:32.923
we're defining the fetch

00:14:33.143 --> 00:14:35.503
method and we're getting the request and the EMV

00:14:35.503 --> 00:14:36.823
with all the bindings and everything.

00:14:37.813 --> 00:14:40.213
And what we're doing is we're basically saying if

00:14:40.213 --> 00:14:41.893
the path is of trpc,

00:14:42.133 --> 00:14:44.933
we're going to pass in that request to this

00:14:44.933 --> 00:14:45.813
fetch request handler,

00:14:45.973 --> 00:14:48.053
which is implementing trpc.

00:14:48.053 --> 00:14:50.733
So it's kind of routing the request to our TRPC

00:14:50.733 --> 00:14:51.733
handler internally.

00:14:52.213 --> 00:14:54.773
So this is basically the entry point of a request.

00:14:55.093 --> 00:14:57.653
So what we can do is we can say init database

00:14:58.133 --> 00:14:59.813
and I'm going to go ahead and import that.

00:15:01.013 --> 00:15:02.213
So it's going to come from

00:15:03.433 --> 00:15:04.073
ops

00:15:05.109 --> 00:15:05.727
database

00:15:08.089 --> 00:15:10.894
and then we can pass in emv.db.

00:15:10.894 --> 00:15:13.202
emv.db.

00:15:14.396 --> 00:15:15.116
oh yeah,

00:15:15.196 --> 00:15:16.876
also one other thing to note here.

00:15:16.956 --> 00:15:18.556
So we've created our.

00:15:19.116 --> 00:15:21.516
We've created our database in Cloudflare,

00:15:21.916 --> 00:15:23.356
we've created those tables,

00:15:23.606 --> 00:15:26.846
but we also need to bind it to our actual worker

00:15:26.846 --> 00:15:27.126
here.

00:15:27.766 --> 00:15:30.166
So we're going to head over to the Wrangler JSON

00:15:30.166 --> 00:15:30.518
file

00:15:31.551 --> 00:15:33.471
and then what we're going to do is we're going to

00:15:33.471 --> 00:15:33.791
say

00:15:34.751 --> 00:15:36.031
A D1 databases

00:15:37.311 --> 00:15:38.271
and it's going to.

00:15:38.351 --> 00:15:39.711
We're going to pass in the binding,

00:15:39.711 --> 00:15:40.751
which is db,

00:15:41.391 --> 00:15:44.271
and then we're also going to want to pass in the,

00:15:44.895 --> 00:15:46.955
we're also going to want to pass in the actual

00:15:46.955 --> 00:15:48.515
database id so

00:15:49.115 --> 00:15:50.555
we can head back to Cloudflare,

00:15:50.875 --> 00:15:52.315
come to our database,

00:15:52.323 --> 00:15:53.295
copy that link,

00:15:58.456 --> 00:16:00.342
paste in this database id,

00:16:00.342 --> 00:16:02.479
and then lastly what we're going to do just to

00:16:02.479 --> 00:16:03.239
make this work,

00:16:03.519 --> 00:16:04.119
so we're actually

00:16:04.599 --> 00:16:06.119
sending data to the

00:16:06.819 --> 00:16:08.279
actual database and Cloudflare

00:16:08.589 --> 00:16:09.549
we're going to enable

00:16:09.869 --> 00:16:11.029
experimental remote.

00:16:11.029 --> 00:16:12.029
But before we do that,

00:16:12.349 --> 00:16:13.149
I'm actually going.

00:16:13.149 --> 00:16:14.389
I'm not going to enable this yet.

00:16:14.389 --> 00:16:15.989
I'm just going to show you what happens here.

00:16:15.989 --> 00:16:16.349
So

00:16:16.669 --> 00:16:18.389
now that we have this thing configured,

00:16:18.389 --> 00:16:19.669
let's kill that application,

00:16:19.669 --> 00:16:20.749
run pnpm,

00:16:23.629 --> 00:16:24.668
run CF

00:16:25.869 --> 00:16:26.589
type gen,

00:16:27.850 --> 00:16:29.174
that's going to create our types.

00:16:29.254 --> 00:16:31.414
So if we come over to this worker configuration,

00:16:31.414 --> 00:16:32.854
you can see that we now have this,

00:16:33.914 --> 00:16:35.114
this D1 database

00:16:35.434 --> 00:16:38.154
as part of our namespace for this Cloudflare

00:16:38.154 --> 00:16:38.474
environment.

00:16:39.354 --> 00:16:41.274
Now we can head back to our index file,

00:16:41.274 --> 00:16:42.696
so the entry point to our worker.

00:16:42.802 --> 00:16:44.914
And you can see that this is no longer throwing a

00:16:44.914 --> 00:16:45.474
type error.

00:16:45.474 --> 00:16:47.394
So we're able to successfully instantiate the

00:16:47.394 --> 00:16:47.914
database.

00:16:47.914 --> 00:16:49.794
So now if we run our application

00:16:50.534 --> 00:16:52.548
and we try to submit that query again,

00:16:52.548 --> 00:16:54.058
we should not get an error.

00:16:54.578 --> 00:16:55.778
But we're also not.

00:16:55.778 --> 00:16:57.578
It's not going to send the data to our actual

00:16:57.578 --> 00:16:58.178
database.

00:16:58.258 --> 00:16:58.658
So

00:16:58.978 --> 00:16:59.938
when this loads,

00:16:59.938 --> 00:17:01.618
I'll show you exactly what I mean here.

00:17:04.745 --> 00:17:05.065
Right,

00:17:05.065 --> 00:17:06.505
so we're going to say

00:17:08.345 --> 00:17:09.385
product one

00:17:09.785 --> 00:17:11.745
and then we're going to give it a destination and

00:17:11.745 --> 00:17:12.705
we're going to hit create link.

00:17:12.705 --> 00:17:13.945
It looks like we got another error.

00:17:13.945 --> 00:17:15.225
Let's just see if we can't quickly

00:17:15.975 --> 00:17:17.495
figure out what is happening here.

00:17:17.655 --> 00:17:17.914
So,

00:17:17.914 --> 00:17:18.454
all right,

00:17:18.454 --> 00:17:19.974
so if you notice that we have a.

00:17:19.974 --> 00:17:21.014
We have an error here.

00:17:21.094 --> 00:17:23.814
Now the reason we have an error here is because

00:17:24.054 --> 00:17:25.654
this is actually trying to

00:17:26.134 --> 00:17:27.894
insert data into a database

00:17:28.374 --> 00:17:29.094
locally.

00:17:29.174 --> 00:17:30.994
So when we run the

00:17:30.994 --> 00:17:32.634
when we run our dev script,

00:17:32.714 --> 00:17:35.194
what happens is it creates a.

00:17:35.834 --> 00:17:38.634
Basically it creates like a fake table or like a

00:17:38.634 --> 00:17:40.474
local table inside of state,

00:17:40.864 --> 00:17:44.064
instead of the rank wrangler folder state and into

00:17:44.064 --> 00:17:44.264
here.

00:17:44.264 --> 00:17:46.064
So you can see that this is actually going to be a

00:17:46.304 --> 00:17:47.584
SQLite file.

00:17:48.004 --> 00:17:49.164
so everything from the project,

00:17:49.164 --> 00:17:51.084
when running locally is actually going to try to

00:17:51.084 --> 00:17:52.804
source the data from this table.

00:17:52.804 --> 00:17:55.244
And the error that we get is basically saying our

00:17:55.244 --> 00:17:57.644
links table that we're inserting data into has not

00:17:57.644 --> 00:17:58.404
been Created.

00:17:58.724 --> 00:17:59.124
Now,

00:17:59.284 --> 00:18:01.804
we could technically run a command and create

00:18:01.804 --> 00:18:02.154
that,

00:18:02.154 --> 00:18:03.224
query in this,

00:18:03.224 --> 00:18:03.544
like,

00:18:03.624 --> 00:18:05.424
SQLite database that's running locally.

00:18:05.424 --> 00:18:06.864
But it's just really tedious.

00:18:06.864 --> 00:18:09.064
And now because Cloudflare has this feature,

00:18:09.154 --> 00:18:10.804
to run experimental remote,

00:18:11.894 --> 00:18:14.294
we can head back over to our Wrangler JSON file.

00:18:14.454 --> 00:18:16.694
We're going to specify that we want to run

00:18:16.694 --> 00:18:18.534
experimental remote as true.

00:18:19.094 --> 00:18:20.854
And then one thing to note,

00:18:20.854 --> 00:18:23.184
it's actually not crazy clear from the docs as of

00:18:23.184 --> 00:18:23.464
today.

00:18:23.784 --> 00:18:26.504
If you go over to your vite config,

00:18:27.704 --> 00:18:28.641
which is over here,

00:18:28.641 --> 00:18:31.206
you can see that we have our Cloudflare vite

00:18:31.206 --> 00:18:31.766
plugin.

00:18:32.086 --> 00:18:34.326
We're also going to want to come into here

00:18:34.806 --> 00:18:37.526
and we're going to want to say experimental

00:18:39.268 --> 00:18:42.148
and it's going to be remote bindings is true.

00:18:42.228 --> 00:18:43.828
So basically this is the same type of

00:18:43.828 --> 00:18:44.348
configuration.

00:18:44.348 --> 00:18:46.948
This just tells our Cloudflare vite config that

00:18:46.948 --> 00:18:47.748
that is the case.

00:18:47.908 --> 00:18:50.068
So now what I need to do is I need to.

00:18:50.468 --> 00:18:51.748
I'm going to run a Wrangler

00:18:53.117 --> 00:18:53.837
logout.

00:18:53.997 --> 00:18:55.957
The only reason I'm doing this is because I have

00:18:55.957 --> 00:18:57.517
other Cloudflare accounts that

00:18:58.077 --> 00:18:58.137
I'm,

00:18:58.297 --> 00:18:58.737
connected to.

00:18:58.737 --> 00:19:00.137
I want to make sure I'm connected to the right

00:19:00.137 --> 00:19:00.417
one.

00:19:00.417 --> 00:19:02.537
You probably don't have to run Wrangler logout.

00:19:02.537 --> 00:19:05.297
And then I'm going to say pnpm run dev.

00:19:05.837 --> 00:19:07.757
This is going to start up our application again.

00:19:08.057 --> 00:19:09.897
and then what it did is it actually.

00:19:11.977 --> 00:19:13.724
It actually opened up a new tab.

00:19:13.724 --> 00:19:15.434
And I think we've gone through this process once

00:19:15.434 --> 00:19:16.034
before already,

00:19:16.114 --> 00:19:18.514
but essentially it's asking if we have permission

00:19:18.514 --> 00:19:18.834
to.

00:19:18.834 --> 00:19:19.434
Or if it.

00:19:19.434 --> 00:19:19.874
If it.

00:19:19.874 --> 00:19:22.154
If we'll grant it permission to connect to that D1

00:19:22.154 --> 00:19:22.594
database.

00:19:22.594 --> 00:19:25.234
Because we're running in the experimental remote

00:19:25.394 --> 00:19:26.714
with experimental remote.

00:19:26.714 --> 00:19:27.074
True.

00:19:27.154 --> 00:19:28.528
So we're going to go ahead and allow that.

00:19:28.678 --> 00:19:30.678
So now we should come back over here and you

00:19:30.678 --> 00:19:31.038
should be.

00:19:31.038 --> 00:19:32.558
We can see that this is actually running

00:19:32.558 --> 00:19:33.070
successfully.

00:19:33.188 --> 00:19:34.536
So one last try here.

00:19:34.611 --> 00:19:36.691
another thing to note is when you run

00:19:37.011 --> 00:19:38.011
experimental dev,

00:19:38.011 --> 00:19:38.691
as of today,

00:19:39.171 --> 00:19:41.171
it takes a minute for it to actually,

00:19:41.251 --> 00:19:41.610
like,

00:19:41.610 --> 00:19:43.931
set up and make the connections and connect and

00:19:43.931 --> 00:19:45.531
authenticate with Cloudflare server.

00:19:45.531 --> 00:19:47.171
So your loading page,

00:19:47.171 --> 00:19:47.891
you're going to notice,

00:19:47.891 --> 00:19:50.091
is actually a little bit longer than what it would

00:19:50.091 --> 00:19:50.931
be if you deployed,

00:19:50.931 --> 00:19:51.131
like,

00:19:51.131 --> 00:19:52.611
if you were to deploy this application.

00:19:52.611 --> 00:19:52.861
The.

00:19:52.931 --> 00:19:54.411
The loading is insanely snappy.

00:19:54.411 --> 00:19:54.771
So,

00:19:55.011 --> 00:19:55.531
okay,

00:19:55.531 --> 00:19:57.651
so we're going to say product one

00:19:59.686 --> 00:20:01.135
and then we're going to give it some random link

00:20:01.135 --> 00:20:02.535
and we're going to say create link.

00:20:02.935 --> 00:20:04.735
And you can see that actually went through

00:20:04.735 --> 00:20:05.575
successfully.

00:20:05.655 --> 00:20:07.495
And if we Head back over to our

00:20:08.055 --> 00:20:11.015
SQL D1 database and we go to explore data.

00:20:11.175 --> 00:20:12.055
We can say

00:20:12.455 --> 00:20:14.535
select star from links

00:20:15.306 --> 00:20:16.915
and you can see that we actually have data in

00:20:16.915 --> 00:20:17.355
there now.

00:20:17.795 --> 00:20:19.635
So at this point what we've done is we've

00:20:19.635 --> 00:20:20.435
successfully

00:20:21.045 --> 00:20:24.405
we've successfully created a query in our packages

00:20:24.675 --> 00:20:26.065
in our data ops package

00:20:27.762 --> 00:20:29.354
that we've exported called Create Link,

00:20:29.434 --> 00:20:30.874
which takes in some link data,

00:20:31.274 --> 00:20:33.035
inserts the data into our database.

00:20:33.215 --> 00:20:34.485
we've then exported this,

00:20:34.805 --> 00:20:36.645
we've exported this from our package.

00:20:36.965 --> 00:20:39.885
We've used the package inside of our actual user

00:20:39.885 --> 00:20:40.485
application,

00:20:40.485 --> 00:20:41.605
our REACT application.

00:20:42.495 --> 00:20:44.395
We've wired it into a TRPC method

00:20:44.395 --> 00:20:45.646
and we have put in

00:20:45.776 --> 00:20:47.486
and we've instantiated our database.

00:20:47.566 --> 00:20:50.046
That way our database is able to

00:20:50.896 --> 00:20:52.576
be accessed within our queries.

00:20:52.576 --> 00:20:54.736
So inside of these queries we're able to get the

00:20:54.736 --> 00:20:56.575
database and then write queries.

00:20:56.576 --> 00:20:58.776
Now this is really nice because in our application

00:20:58.776 --> 00:20:59.856
code it's very,

00:20:59.856 --> 00:21:00.576
very simple.

00:21:00.586 --> 00:21:03.016
all we have to do is we have to implement

00:21:03.203 --> 00:21:05.693
we just basically like use the method that we've

00:21:05.693 --> 00:21:07.893
exported from our package and then we interface

00:21:07.893 --> 00:21:08.773
with data that way.

00:21:08.773 --> 00:21:10.573
So what you're going to notice is this is a

00:21:10.953 --> 00:21:12.233
very scalable way of

00:21:12.303 --> 00:21:13.913
this is a very scalable way of

00:21:15.953 --> 00:21:18.113
building a project just because it kind of like,

00:21:18.113 --> 00:21:20.433
it makes your code very modular and it makes it so

00:21:20.433 --> 00:21:21.353
you can reuse things.

00:21:21.353 --> 00:21:23.513
And it's really easy to know like okay,

00:21:23.513 --> 00:21:24.593
I have a schema,

00:21:24.593 --> 00:21:26.273
it's going to be in a schemas package.

00:21:26.353 --> 00:21:27.153
I have a,

00:21:27.153 --> 00:21:28.593
like a Zod schema is going to be a schema's

00:21:28.593 --> 00:21:28.793
package.

00:21:28.793 --> 00:21:30.753
If I have a query it's going to be in a queries

00:21:30.753 --> 00:21:31.473
package and then

00:21:31.743 --> 00:21:33.733
you can kind of like mentally keep track of what's

00:21:33.733 --> 00:21:34.773
going on a lot easier.

00:21:34.933 --> 00:21:35.853
One note here,

00:21:35.853 --> 00:21:36.933
there's an actual bug

00:21:37.263 --> 00:21:38.463
is this Create link.

00:21:38.703 --> 00:21:40.063
It returns an id.

00:21:40.303 --> 00:21:41.423
So we're going to say const

00:21:42.190 --> 00:21:43.070
link id

00:21:44.583 --> 00:21:47.223
then we are going to return that link id

00:21:47.581 --> 00:21:48.507
because if we look here,

00:21:48.667 --> 00:21:50.987
it actually probably navigated over to

00:21:51.307 --> 00:21:52.187
random id,

00:21:52.187 --> 00:21:54.347
which is not the behavior that we want.

00:21:55.147 --> 00:21:57.547
We want to be able to basically say create.

00:21:58.907 --> 00:22:00.867
We want to be able to create that link and then it

00:22:00.867 --> 00:22:03.281
will navigate to the link ID that was created.

00:22:03.549 --> 00:22:05.549
So Optimistic Parrot Random name,

00:22:05.709 --> 00:22:07.309
it's going to go to this URL.

00:22:07.309 --> 00:22:08.029
We hit create

00:22:08.349 --> 00:22:10.149
and then what you see here is it actually

00:22:10.149 --> 00:22:12.079
navigates to this link that is a random

00:22:12.299 --> 00:22:13.099
nano id.

00:22:13.899 --> 00:22:14.339
So yeah,

00:22:14.339 --> 00:22:16.059
I think that this was a really good section.

00:22:16.059 --> 00:22:17.699
And then in this next section we're going to start

00:22:17.699 --> 00:22:19.379
building out a whole bunch of other queries just

00:22:19.379 --> 00:22:19.859
to kind of,

00:22:19.859 --> 00:22:20.139
like,

00:22:20.299 --> 00:22:22.259
build this habit and build this pattern so we can

00:22:22.259 --> 00:22:23.246
solidify the skill.

