WEBVTT
X-TIMESTAMP-MAP=LOCAL:00:00:00.000,MPEGTS:900000

00:00:00.034 --> 00:00:00.274
All right,

00:00:00.274 --> 00:00:01.994
so now that we've gone through the process of

00:00:01.994 --> 00:00:03.714
building these links within our,

00:00:03.714 --> 00:00:06.194
within a package in our Monorepo and then wiring

00:00:06.194 --> 00:00:07.874
them into our TRPC routes,

00:00:08.114 --> 00:00:10.234
let's go through the process of finishing off all

00:00:10.234 --> 00:00:12.634
of the CRUD operations before we move into the

00:00:12.634 --> 00:00:14.034
more sophisticated and

00:00:14.484 --> 00:00:15.674
complex things with this project.

00:00:15.914 --> 00:00:17.434
So if you look here,

00:00:17.434 --> 00:00:19.714
we have our Create link function that we just

00:00:19.714 --> 00:00:20.234
created.

00:00:20.674 --> 00:00:20.934
we,

00:00:21.004 --> 00:00:22.524
we also have this links

00:00:22.844 --> 00:00:24.884
data table where all the links that have been

00:00:24.884 --> 00:00:25.964
created will show up here.

00:00:26.044 --> 00:00:27.604
you'll be able to see the actual link,

00:00:28.304 --> 00:00:31.064
that you can use as like the short link and then

00:00:31.064 --> 00:00:31.904
you can copy it,

00:00:32.064 --> 00:00:34.384
but you can also click on that link and you'll go

00:00:34.384 --> 00:00:35.264
to the link page.

00:00:35.344 --> 00:00:37.424
Now this link page also has a bunch of CRUD

00:00:37.424 --> 00:00:37.864
operations.

00:00:37.864 --> 00:00:38.784
Like you're able to

00:00:39.364 --> 00:00:40.064
edit the name,

00:00:40.144 --> 00:00:41.453
so you can put in a new name,

00:00:41.692 --> 00:00:44.205
you can edit the default destination URL.

00:00:44.285 --> 00:00:46.005
So if you're going to change where this is going

00:00:46.005 --> 00:00:46.765
to be routed,

00:00:47.175 --> 00:00:49.095
and then you can additionally you can

00:00:49.165 --> 00:00:51.415
enable or disable GEO routing.

00:00:51.415 --> 00:00:53.055
So if you want to

00:00:53.495 --> 00:00:55.335
say like everybody in

00:00:55.521 --> 00:00:56.401
Albania

00:00:56.721 --> 00:00:58.871
is going to be routed to a separate link,

00:00:58.871 --> 00:00:59.941
that's going to be controlled here,

00:00:59.941 --> 00:01:02.261
but you could also turn off GEO routing for

00:01:02.741 --> 00:01:03.901
a given link.

00:01:03.901 --> 00:01:04.981
So that's the,

00:01:05.141 --> 00:01:06.861
these are kind of like the CRUD operations that

00:01:06.861 --> 00:01:08.181
are going to power the application.

00:01:08.181 --> 00:01:09.621
And then once we have these done,

00:01:09.861 --> 00:01:10.121
we,

00:01:10.191 --> 00:01:11.791
we'll be able to actually get some data in the

00:01:11.791 --> 00:01:13.431
database and then we're going to be able to build

00:01:13.431 --> 00:01:15.271
out a backend system on top of it.

00:01:15.271 --> 00:01:16.671
And that's like the really fun part.

00:01:16.671 --> 00:01:18.031
So let's go ahead and do that.

00:01:18.031 --> 00:01:19.711
The first thing that I want to do is I want to

00:01:20.031 --> 00:01:22.871
create like have real live data show up in this

00:01:22.871 --> 00:01:23.551
data table.

00:01:23.791 --> 00:01:26.111
So if we head back over to our package,

00:01:26.831 --> 00:01:28.951
what we want to do is we're going to want to

00:01:28.951 --> 00:01:30.511
create a new query.

00:01:30.511 --> 00:01:32.031
And this query is going to be called

00:01:32.351 --> 00:01:33.231
Get Links.

00:01:33.231 --> 00:01:34.351
And for the sake of time,

00:01:34.351 --> 00:01:36.271
because this is quite a bit to type,

00:01:36.731 --> 00:01:37.851
just going to paste it in here

00:01:38.811 --> 00:01:40.291
and then we'll just kind of walk through what

00:01:40.291 --> 00:01:40.731
we're doing.

00:01:40.811 --> 00:01:41.211
So,

00:01:42.421 --> 00:01:44.036
make sure all these guys are imported

00:01:44.036 --> 00:01:44.766
greater than that.

00:01:47.525 --> 00:01:49.486
So essentially what this query is going to do and

00:01:49.486 --> 00:01:51.366
we're not going to like have to talk about every

00:01:51.366 --> 00:01:52.566
single query in this detail,

00:01:52.566 --> 00:01:54.086
but I just kind of want to show you how

00:01:54.406 --> 00:01:54.806
these

00:01:54.826 --> 00:01:56.366
these query abstractions,

00:01:56.366 --> 00:01:57.486
where you put it behind a method,

00:01:57.486 --> 00:01:58.766
how they can be really powerful.

00:01:58.766 --> 00:02:00.246
So essentially what we're doing is we're Doing

00:02:00.246 --> 00:02:01.726
that same convention where we have

00:02:02.506 --> 00:02:04.466
an account ID because we want to just see all the

00:02:04.466 --> 00:02:05.626
links for a given account

00:02:05.693 --> 00:02:06.676
and then we're going to have some,

00:02:06.676 --> 00:02:09.076
an optional property which is created before.

00:02:09.076 --> 00:02:10.876
And what this is going to do is if somebody has

00:02:10.876 --> 00:02:11.956
like thousands of links,

00:02:11.956 --> 00:02:14.236
we'll be able to implement pagination where we can

00:02:14.236 --> 00:02:14.916
basically say

00:02:15.236 --> 00:02:18.436
show us like 15 links created before this date and

00:02:18.436 --> 00:02:20.396
then we get that last date and then we say create

00:02:20.396 --> 00:02:21.436
it before this date.

00:02:21.436 --> 00:02:23.076
so this is a very simple way of implementing

00:02:23.156 --> 00:02:25.236
pagination where you have a limit number

00:02:25.796 --> 00:02:27.156
and you also have a

00:02:28.026 --> 00:02:28.666
created before.

00:02:28.986 --> 00:02:30.746
Now what we do is we basically have these

00:02:30.746 --> 00:02:31.226
conditions.

00:02:31.546 --> 00:02:34.266
So these are going to be the filters of the query

00:02:34.586 --> 00:02:35.866
and we're going to have a default.

00:02:35.866 --> 00:02:37.946
So we're always going to filter by account ID

00:02:38.426 --> 00:02:39.146
and then

00:02:40.026 --> 00:02:41.586
if created before is defined,

00:02:41.586 --> 00:02:43.066
we're going to go ahead and push in

00:02:43.466 --> 00:02:44.826
a greater than query.

00:02:44.826 --> 00:02:45.746
So what this is saying is,

00:02:45.746 --> 00:02:48.106
this is saying on the column created,

00:02:48.106 --> 00:02:50.186
which is like the created time of that link,

00:02:51.806 --> 00:02:53.326
show us anything that's greater than the

00:02:53.366 --> 00:02:54.546
created before date.

00:02:55.106 --> 00:02:57.266
And then just a very simple select.

00:02:57.266 --> 00:02:59.026
So we're going to select link id,

00:02:59.346 --> 00:03:01.026
the destinations array,

00:03:01.486 --> 00:03:03.736
or destinations object or JSON object,

00:03:04.283 --> 00:03:05.323
the created time

00:03:05.963 --> 00:03:06.923
and the link name.

00:03:07.163 --> 00:03:09.563
This is going to be coming from links

00:03:09.963 --> 00:03:10.363
where

00:03:10.683 --> 00:03:11.483
our conditions

00:03:11.963 --> 00:03:13.963
Account ID is of that account ID

00:03:13.996 --> 00:03:16.064
and is before that created date.

00:03:16.104 --> 00:03:18.464
And then we're going to order that by create a

00:03:18.464 --> 00:03:19.300
date so it's sorted.

00:03:19.300 --> 00:03:21.938
And then we are going to say limit 25.

00:03:22.018 --> 00:03:22.398
So

00:03:22.398 --> 00:03:23.938
it'll always only return 25.

00:03:23.938 --> 00:03:25.098
And this is going to power that.

00:03:25.098 --> 00:03:25.358
This

00:03:25.918 --> 00:03:27.188
this data table right here.

00:03:27.559 --> 00:03:28.318
So remember,

00:03:28.318 --> 00:03:30.359
every single time we add a new query in here,

00:03:30.679 --> 00:03:33.239
we're going to want to make sure we are in our

00:03:33.399 --> 00:03:34.439
data ops

00:03:35.159 --> 00:03:35.639
package.

00:03:35.639 --> 00:03:36.919
So I'm going to say packages

00:03:39.169 --> 00:03:41.649
data ops and then I'm going to say pnpm

00:03:42.049 --> 00:03:42.449
run

00:03:43.009 --> 00:03:43.409
build.

00:03:44.209 --> 00:03:45.329
It's going to build the project,

00:03:45.489 --> 00:03:46.689
it will dump

00:03:47.169 --> 00:03:49.569
get links into that disk folder and then we'll be

00:03:49.569 --> 00:03:51.409
able to use it in our other application.

00:03:51.489 --> 00:03:53.409
So now what we're going to want to do is we're

00:03:53.409 --> 00:03:55.249
going to head over to our user application,

00:03:56.239 --> 00:03:59.079
and then I think it might be best if we kind of

00:03:59.079 --> 00:04:01.199
worked from the UI to the backend.

00:04:01.279 --> 00:04:03.359
So if we come over to our source

00:04:03.959 --> 00:04:04.759
and we go to Routes,

00:04:04.759 --> 00:04:07.079
so in our front end we go to Routes app

00:04:07.639 --> 00:04:08.039
auth,

00:04:08.199 --> 00:04:11.079
then we're going to head over to our links.

00:04:11.479 --> 00:04:12.774
this is our links page.

00:04:12.774 --> 00:04:13.759
Now this links page

00:04:13.759 --> 00:04:14.639
has a loader,

00:04:15.029 --> 00:04:17.419
that pre fetches Data from the links list,

00:04:17.419 --> 00:04:19.199
which is basically this data right here.

00:04:19.199 --> 00:04:20.674
And what we can do is basically.

00:04:20.674 --> 00:04:21.154
So it's,

00:04:21.154 --> 00:04:22.354
what it's doing is it's pace,

00:04:22.354 --> 00:04:22.674
it's,

00:04:22.674 --> 00:04:22.944
it's

00:04:23.674 --> 00:04:24.794
it's passing in the data,

00:04:24.794 --> 00:04:26.474
it's grabbing data from that links list

00:04:26.794 --> 00:04:28.154
and it's not passing any

00:04:28.474 --> 00:04:29.334
input because

00:04:29.391 --> 00:04:29.706
the

00:04:30.026 --> 00:04:32.506
only input that's needed is the created before

00:04:32.586 --> 00:04:32.986
time.

00:04:33.146 --> 00:04:35.586
And for the very first load of the page we

00:04:35.586 --> 00:04:37.386
actually don't need to grab that created before

00:04:37.546 --> 00:04:38.586
because it's just going to

00:04:38.906 --> 00:04:41.331
grab like the 25 most recent links.

00:04:41.331 --> 00:04:43.091
so if we come over here you can see that we're

00:04:43.091 --> 00:04:44.171
using the suspense query.

00:04:44.171 --> 00:04:46.251
So this is where we actually access that data in

00:04:46.251 --> 00:04:47.143
our root component.

00:04:47.143 --> 00:04:47.436
And

00:04:47.946 --> 00:04:49.946
we can see exactly where this links is used.

00:04:50.266 --> 00:04:51.626
So I'm just going to say

00:04:51.866 --> 00:04:52.766
links dot

00:04:53.166 --> 00:04:53.470
so

00:04:54.066 --> 00:04:54.294
so

00:04:54.294 --> 00:04:56.606
so basically so we're getting this links data and

00:04:56.606 --> 00:04:59.286
then throw down here a little bit deeper into our

00:04:59.286 --> 00:04:59.646
code.

00:04:59.646 --> 00:05:01.606
We're going to notice that we actually have this

00:05:01.606 --> 00:05:01.952
table

00:05:02.004 --> 00:05:04.084
and this table is going to

00:05:04.384 --> 00:05:05.244
this table has like.

00:05:05.244 --> 00:05:06.524
So this is a tan stack table.

00:05:06.524 --> 00:05:07.964
We're not going to dive too deep into this.

00:05:07.964 --> 00:05:10.364
But if you're building really complicated tables

00:05:10.364 --> 00:05:12.324
where you have like a bunch of features you want

00:05:12.324 --> 00:05:13.084
to be able to sort,

00:05:13.084 --> 00:05:13.924
move stuff around,

00:05:14.504 --> 00:05:16.144
just have a bunch of like functionality right out

00:05:16.144 --> 00:05:16.744
of the box.

00:05:16.744 --> 00:05:18.584
Tan stack table is,

00:05:18.584 --> 00:05:21.264
or tanstack react table is an insanely good

00:05:21.364 --> 00:05:22.144
package to you.

00:05:22.144 --> 00:05:24.344
So we're not going to get super deep into it.

00:05:24.344 --> 00:05:27.024
But just know like we can define some columns,

00:05:27.404 --> 00:05:28.884
can style those columns,

00:05:28.884 --> 00:05:29.724
we can give like,

00:05:29.724 --> 00:05:30.964
we can put buttons in there.

00:05:31.124 --> 00:05:33.624
this is a specific one where it has like a copy

00:05:33.624 --> 00:05:35.504
button and when you copy it it copies it to the

00:05:35.504 --> 00:05:35.984
clipboard.

00:05:35.984 --> 00:05:37.584
So it's really cool what we can do here.

00:05:37.584 --> 00:05:39.904
but what happens is we go further down and we

00:05:39.904 --> 00:05:41.897
basically say that the data is the links

00:05:41.919 --> 00:05:42.319
and

00:05:42.919 --> 00:05:44.519
this is going to wire into

00:05:45.078 --> 00:05:46.359
this is going to get table,

00:05:46.439 --> 00:05:48.439
get the rows and it's basically going to start

00:05:48.439 --> 00:05:50.479
iterating and creating the

00:05:50.479 --> 00:05:51.779
the table for us here.

00:05:51.779 --> 00:05:53.219
So that's what's going on.

00:05:53.219 --> 00:05:55.459
So essentially what we need to do is we need to

00:05:55.459 --> 00:05:58.019
populate or actually like wire in the query that

00:05:58.019 --> 00:05:59.219
we just created on our back.

00:06:00.219 --> 00:06:01.099
this linked list,

00:06:01.549 --> 00:06:02.829
linked list method.

00:06:02.829 --> 00:06:05.469
So we can command click on that and it's going to

00:06:05.469 --> 00:06:07.389
take us over to worker TRPC routes,

00:06:07.469 --> 00:06:08.149
links.

00:06:08.149 --> 00:06:10.169
you could also navigate on the left sidebar if

00:06:10.169 --> 00:06:11.129
that's what you like to do.

00:06:11.369 --> 00:06:12.649
So you can see that this

00:06:12.899 --> 00:06:14.691
that this specific procedure

00:06:14.691 --> 00:06:15.845
takes in a

00:06:16.055 --> 00:06:19.065
optional offset which is a number which is

00:06:19.065 --> 00:06:20.025
actually just that date,

00:06:20.025 --> 00:06:20.345
time,

00:06:21.465 --> 00:06:22.025
and then

00:06:22.425 --> 00:06:23.545
it is going to

00:06:23.837 --> 00:06:25.677
And then what it's going to do is it's going to

00:06:25.997 --> 00:06:28.397
return this dummy data which is just this big

00:06:28.397 --> 00:06:28.957
stupid

00:06:28.987 --> 00:06:30.127
dummy array of

00:06:30.847 --> 00:06:31.205
just

00:06:31.205 --> 00:06:33.016
random like links and dummy data.

00:06:33.096 --> 00:06:35.576
So I'm going to go ahead and I'm going to delete

00:06:35.816 --> 00:06:36.776
all this stuff

00:06:36.958 --> 00:06:37.772
head back over here.

00:06:37.772 --> 00:06:39.144
We should be getting a type error

00:06:39.227 --> 00:06:39.627
and

00:06:39.757 --> 00:06:41.327
what I'm going to do is I'm going to basically say

00:06:41.327 --> 00:06:41.616
like

00:06:42.728 --> 00:06:43.208
await.

00:06:44.248 --> 00:06:46.408
Get links is the method that we defined

00:06:47.368 --> 00:06:49.928
and this should be coming from our queries over

00:06:49.928 --> 00:06:52.208
here so we can head over to our.

00:06:52.208 --> 00:06:54.248
I'm going to first delete this links list

00:06:54.661 --> 00:06:56.822
and then I am going to say

00:06:57.782 --> 00:06:58.182
get

00:06:59.342 --> 00:07:00.622
get links.

00:07:00.862 --> 00:07:01.262
So

00:07:02.246 --> 00:07:02.606
All right,

00:07:02.606 --> 00:07:05.366
so now that we have this get links method that

00:07:05.366 --> 00:07:06.726
we've defined in our package,

00:07:06.886 --> 00:07:06.976
or

00:07:06.976 --> 00:07:08.286
in our Data Ops package,

00:07:08.286 --> 00:07:09.966
now that we have this imported,

00:07:10.206 --> 00:07:12.366
we can come over here and then what we're going to

00:07:12.366 --> 00:07:13.965
see is this is going to take in,

00:07:14.112 --> 00:07:16.170
this is going to take in an account ID and a

00:07:16.170 --> 00:07:17.250
created before time.

00:07:17.410 --> 00:07:17.577
So

00:07:17.577 --> 00:07:19.121
what we are going to want to do is we're going to

00:07:19.121 --> 00:07:19.761
want to say,

00:07:19.811 --> 00:07:21.161
we're going to grab context.

00:07:21.161 --> 00:07:22.681
We're also going to grab input

00:07:23.301 --> 00:07:26.981
inside of our query for our tenants for our TRPC

00:07:27.061 --> 00:07:27.541
query.

00:07:27.781 --> 00:07:28.581
And then the

00:07:28.901 --> 00:07:32.381
the account ID for our use case is going to be the

00:07:32.381 --> 00:07:33.781
user info.id.

00:07:33.781 --> 00:07:34.821
now this is dummy data.

00:07:34.821 --> 00:07:36.581
Right now we're going to get deeper into this in

00:07:36.581 --> 00:07:37.421
the off section.

00:07:37.421 --> 00:07:38.821
So for the sake of

00:07:38.851 --> 00:07:39.981
this part of the course,

00:07:39.981 --> 00:07:40.821
just like no,

00:07:40.981 --> 00:07:42.701
you're going to understand where this is coming

00:07:42.701 --> 00:07:44.080
from and why at a later time.

00:07:44.324 --> 00:07:46.114
And then we're also going to pass in the

00:07:46.874 --> 00:07:48.474
input which we have the,

00:07:48.714 --> 00:07:49.794
the optional offset.

00:07:49.794 --> 00:07:51.624
And we're calling this offset because this is

00:07:51.771 --> 00:07:54.391
because this is meant to be the actual like date

00:07:54.391 --> 00:07:56.151
time that's going to be passed when we add

00:07:56.151 --> 00:07:56.714
pagination.

00:07:58.947 --> 00:07:59.347
And

00:07:59.747 --> 00:08:01.667
the only thing that we have to do here is because

00:08:01.667 --> 00:08:02.787
this is going to be a number,

00:08:02.787 --> 00:08:04.987
is we just need to make sure we cast that guy to a

00:08:04.987 --> 00:08:05.307
string.

00:08:05.307 --> 00:08:05.517
So

00:08:06.387 --> 00:08:06.707
okay,

00:08:06.707 --> 00:08:09.827
so from here we have our input offset to string.

00:08:09.827 --> 00:08:12.147
So we're able to basically say whenever this

00:08:12.407 --> 00:08:14.187
whenever this procedure gets called with

00:08:14.667 --> 00:08:15.067
the,

00:08:15.067 --> 00:08:16.587
with the before date specified,

00:08:17.147 --> 00:08:18.987
it'll be picked up here and if not

00:08:19.387 --> 00:08:20.827
undefined will be passed in.

00:08:20.907 --> 00:08:23.227
So now we're successfully able to call this

00:08:23.307 --> 00:08:23.847
endpoint.

00:08:23.847 --> 00:08:25.687
And then what we should see is when we run our

00:08:25.687 --> 00:08:26.527
user application

00:08:29.010 --> 00:08:30.450
and we head back over here

00:08:31.090 --> 00:08:32.770
when this links page loads,

00:08:33.170 --> 00:08:34.650
if we did everything correctly,

00:08:34.650 --> 00:08:36.330
we should see that this table is going to be

00:08:36.330 --> 00:08:39.170
populated with that one link that we have created.

00:08:39.330 --> 00:08:41.370
So the loading is going to take a little bit.

00:08:41.370 --> 00:08:41.730
And this,

00:08:41.730 --> 00:08:43.610
this is just because we're using the experimental

00:08:43.610 --> 00:08:44.240
dev mode.

00:08:44.449 --> 00:08:46.290
I do suspect that this will get faster as

00:08:46.290 --> 00:08:48.610
Cloudflare builds out this feature a little bit.

00:08:48.690 --> 00:08:50.330
So you can see here's the two links that we've

00:08:50.330 --> 00:08:50.650
created.

00:08:50.650 --> 00:08:52.730
We've created Optimistic Parrot and Product one.

00:08:52.730 --> 00:08:54.450
And if we go through this process and we say

00:08:55.480 --> 00:08:55.720
Product

00:08:56.120 --> 00:08:56.520
three

00:08:57.080 --> 00:08:59.440
and then we just give it another random link and

00:08:59.440 --> 00:09:01.600
we hit create when we head back over to that

00:09:01.600 --> 00:09:01.880
links.

00:09:01.880 --> 00:09:03.680
Now you can see we have three here and we can

00:09:03.680 --> 00:09:04.280
click on it.

00:09:04.620 --> 00:09:06.460
and the data that's actually under this page is

00:09:06.460 --> 00:09:07.540
still just dummy data,

00:09:07.940 --> 00:09:08.740
but now what,

00:09:08.740 --> 00:09:10.980
we've successfully populated this data table.

00:09:11.300 --> 00:09:12.740
So let's actually go through the process

00:09:13.060 --> 00:09:15.780
of building out all of the CRUD operations here.

00:09:15.940 --> 00:09:16.330
and this,

00:09:16.330 --> 00:09:17.330
we're going to go through this really,

00:09:17.330 --> 00:09:18.850
really quickly just for the purpose of time

00:09:18.850 --> 00:09:19.730
because I don't really,

00:09:19.730 --> 00:09:21.110
I don't think it really matters to

00:09:21.190 --> 00:09:23.110
like solidify this like

00:09:23.820 --> 00:09:24.540
UI setup.

00:09:24.540 --> 00:09:26.780
I really want to get to the actual data operations

00:09:26.780 --> 00:09:28.260
on the back end because that's where our learning

00:09:28.260 --> 00:09:29.500
is just going to accelerate.

00:09:30.780 --> 00:09:31.340
Okay,

00:09:31.340 --> 00:09:34.220
so if we head back over to our data Ops package

00:09:34.220 --> 00:09:35.500
and we go to these queries,

00:09:35.500 --> 00:09:37.060
I'm just going to dump a bunch of other queries

00:09:37.060 --> 00:09:38.540
that we're going to need right now.

00:09:38.700 --> 00:09:39.100
So

00:09:39.500 --> 00:09:42.580
we're going to want to have a query that updates

00:09:42.580 --> 00:09:43.500
the link name.

00:09:43.740 --> 00:09:45.580
So this is getting the database,

00:09:45.660 --> 00:09:47.980
it's going to the links table and it's going to

00:09:47.980 --> 00:09:50.780
update the name and the updated time where their

00:09:50.860 --> 00:09:52.312
link ID equals link id.

00:09:52.355 --> 00:09:53.635
We're also going to

00:09:54.348 --> 00:09:55.988
we're also going to create a method called Get

00:09:55.988 --> 00:09:58.788
Link and this is going to basically give us like

00:09:58.788 --> 00:10:00.828
that basic link information on this page,

00:10:01.258 --> 00:10:02.538
right when the page loads.

00:10:02.538 --> 00:10:04.818
So like the name and destination URLs and all that

00:10:04.818 --> 00:10:05.418
fun stuff.

00:10:05.498 --> 00:10:05.898
So

00:10:06.813 --> 00:10:09.093
so what we have here is basically like we're just

00:10:09.093 --> 00:10:10.813
selecting that whole row,

00:10:11.443 --> 00:10:12.213
based upon

00:10:12.693 --> 00:10:13.093
a

00:10:13.503 --> 00:10:14.393
given link id.

00:10:14.713 --> 00:10:16.833
And it looks like we're using a schema here as

00:10:16.833 --> 00:10:17.113
well.

00:10:17.113 --> 00:10:18.873
So we're going to import this from that

00:10:19.263 --> 00:10:22.143
zodlink schema and you can see that this is our

00:10:22.303 --> 00:10:24.703
schema for an actual link.

00:10:24.863 --> 00:10:25.823
So link id,

00:10:25.823 --> 00:10:26.623
Account ID name,

00:10:26.623 --> 00:10:27.303
destinations,

00:10:27.303 --> 00:10:27.943
Create and update.

00:10:27.943 --> 00:10:29.423
It's a pretty simple schema here.

00:10:29.463 --> 00:10:30.023
so we're gonna,

00:10:30.023 --> 00:10:30.789
we can save that,

00:10:30.789 --> 00:10:31.797
head back over here.

00:10:32.337 --> 00:10:34.617
we're also going to want to update the link

00:10:34.617 --> 00:10:35.097
destination.

00:10:35.417 --> 00:10:35.817
So

00:10:36.117 --> 00:10:38.217
the default destination of where the link is

00:10:38.217 --> 00:10:38.817
routed to,

00:10:39.217 --> 00:10:40.417
which is going to be this one.

00:10:40.417 --> 00:10:41.777
And then any additional

00:10:42.377 --> 00:10:43.977
like geo routing that we,

00:10:44.367 --> 00:10:46.287
a Nate what that we configure at a link level.

00:10:46.447 --> 00:10:47.817
It's also going to be powered

00:10:47.817 --> 00:10:48.047
by,

00:10:48.047 --> 00:10:49.087
by this call.

00:10:49.247 --> 00:10:50.847
So we can create another,

00:10:52.207 --> 00:10:53.167
we can create another

00:10:54.047 --> 00:10:56.127
another function here called Update link

00:10:56.127 --> 00:10:58.447
destinations and then we will

00:11:00.045 --> 00:11:01.165
import this type.

00:11:01.245 --> 00:11:02.725
So the destinations type.

00:11:02.725 --> 00:11:05.165
If you look here it's going to be this object and

00:11:05.165 --> 00:11:06.045
this is kind of an actual,

00:11:06.045 --> 00:11:06.925
this is actually a

00:11:08.125 --> 00:11:09.605
You might look at this and think this is kind of a

00:11:09.605 --> 00:11:10.405
complicated type.

00:11:10.405 --> 00:11:10.765
But

00:11:11.165 --> 00:11:13.965
what essentially what we have here is we have a

00:11:14.265 --> 00:11:16.325
ZOD object that takes in

00:11:17.265 --> 00:11:20.305
a key of default and this is the default URL

00:11:20.705 --> 00:11:21.345
and then

00:11:21.825 --> 00:11:24.545
it can have any other key value pair and the key

00:11:24.545 --> 00:11:27.225
value pairs is basically a country ID and a

00:11:27.225 --> 00:11:28.385
destination URL.

00:11:28.545 --> 00:11:28.945
So

00:11:29.135 --> 00:11:30.865
it's like kind of this interesting type that we've

00:11:30.865 --> 00:11:32.545
defined so we always know we can call

00:11:32.545 --> 00:11:35.905
object.default to have a default URL and then

00:11:36.455 --> 00:11:37.835
any other key in there is essentially,

00:11:37.905 --> 00:11:40.295
essentially going to be like a location based

00:11:40.295 --> 00:11:41.475
routing configuration.

00:11:42.188 --> 00:11:42.674
All right,

00:11:42.834 --> 00:11:45.291
so let's head back over to our links

00:11:45.291 --> 00:11:46.774
so you can see that we're gonna,

00:11:47.014 --> 00:11:47.814
we basically

00:11:48.184 --> 00:11:49.754
take in this destinations type,

00:11:49.754 --> 00:11:50.473
we parse it,

00:11:50.473 --> 00:11:52.434
make sure it is totally safe before we stick it

00:11:52.434 --> 00:11:53.154
into our database.

00:11:53.154 --> 00:11:54.954
And this is a pattern that I like to follow where

00:11:55.364 --> 00:11:57.824
I have a type defined just so it kind of helps

00:11:57.824 --> 00:11:59.664
with like the type hinting when you're putting

00:11:59.664 --> 00:12:00.784
data into a method.

00:12:00.864 --> 00:12:01.164
But,

00:12:01.314 --> 00:12:04.314
but I also like to do a parsing on it because I

00:12:04.314 --> 00:12:06.194
would rather throw an error at the application

00:12:06.194 --> 00:12:06.914
runtime

00:12:07.014 --> 00:12:08.954
before the data actually makes it into the

00:12:08.954 --> 00:12:09.554
database.

00:12:10.124 --> 00:12:12.364
then like I'd rather throw that error than

00:12:12.364 --> 00:12:14.924
basically not do this and then have the potential

00:12:14.924 --> 00:12:16.924
of like wrong application code

00:12:17.884 --> 00:12:19.324
bad data into our database.

00:12:19.324 --> 00:12:21.044
So this is like an extra layer of protection that

00:12:21.044 --> 00:12:22.484
I like to do when I'm building out

00:12:22.944 --> 00:12:24.964
these queries is like if I have like some type of

00:12:24.964 --> 00:12:27.444
sensitive type that I need to update I like to do

00:12:27.444 --> 00:12:29.324
a little bit of pre processing beforehand.

00:12:29.664 --> 00:12:30.304
yeah so the,

00:12:30.304 --> 00:12:32.304
this shouldn't be everything that we need to power

00:12:32.304 --> 00:12:32.504
this.

00:12:32.504 --> 00:12:33.664
We'll be able to update this.

00:12:33.824 --> 00:12:36.144
We'll be able to enable geo routing and whatnot

00:12:36.144 --> 00:12:37.904
and then we'll also be able to

00:12:38.264 --> 00:12:40.544
you know put like where a country is going to be

00:12:40.544 --> 00:12:41.224
routed to.

00:12:41.384 --> 00:12:41.740
So

00:12:41.740 --> 00:12:42.801
make sure this is saved.

00:12:43.041 --> 00:12:44.761
And then we are going to npm,

00:12:44.761 --> 00:12:45.041
run,

00:12:45.601 --> 00:12:46.001
build,

00:12:46.001 --> 00:12:47.201
we're going to build this guy.

00:12:47.521 --> 00:12:49.201
This is going to make sure all of these

00:12:49.681 --> 00:12:51.361
queries that we have just defined

00:12:51.691 --> 00:12:53.451
are available for our packages

00:12:54.111 --> 00:12:55.871
and then we'll head over to our application

00:12:56.191 --> 00:12:58.191
and what we can do here is

00:12:58.751 --> 00:13:00.271
we're going to want to go to our

00:13:00.491 --> 00:13:01.631
we're going to want to go to our

00:13:02.111 --> 00:13:02.751
ui,

00:13:02.911 --> 00:13:03.871
go to the app

00:13:04.271 --> 00:13:05.391
and then you can see

00:13:05.711 --> 00:13:06.671
we have link,

00:13:07.271 --> 00:13:10.771
link $sign ID and this is kind of where this like

00:13:11.301 --> 00:13:14.288
dynamic variable of that ID is going to be pulled

00:13:14.288 --> 00:13:16.553
and then what you're going to notice here is when

00:13:16.553 --> 00:13:17.753
this component is loaded.

00:13:17.753 --> 00:13:19.433
So when this page is loaded for the very first

00:13:19.433 --> 00:13:19.716
time

00:13:19.811 --> 00:13:22.971
we're going to pre fetch our gitlink data and that

00:13:22.971 --> 00:13:23.731
get link Data,

00:13:23.921 --> 00:13:24.971
is going to be used

00:13:25.291 --> 00:13:26.891
throughout this entire component.

00:13:26.971 --> 00:13:27.371
So

00:13:27.801 --> 00:13:29.451
we're not going to go too deep into like you can,

00:13:29.451 --> 00:13:31.051
you can kind of like go through and see where it's

00:13:31.051 --> 00:13:31.451
being used.

00:13:31.451 --> 00:13:32.771
But for the purpose of this,

00:13:32.771 --> 00:13:34.691
let's just head over to our TRPC

00:13:34.781 --> 00:13:36.113
route on the back end

00:13:36.113 --> 00:13:38.478
and let's add in the gitlink call.

00:13:38.478 --> 00:13:40.278
So you can see we have some dummy data here.

00:13:40.358 --> 00:13:42.358
So what I'm going to do is I'm basically going to

00:13:42.358 --> 00:13:42.598
say

00:13:42.803 --> 00:13:43.283
input

00:13:43.683 --> 00:13:45.603
and this is going to take a link ID

00:13:46.083 --> 00:13:47.763
and then we can say await.

00:13:48.003 --> 00:13:48.883
Let's say const

00:13:50.083 --> 00:13:51.843
data equals await,

00:13:52.243 --> 00:13:53.283
get link

00:13:53.763 --> 00:13:55.923
that should import it and we'll pass in that link

00:13:55.923 --> 00:13:56.243
id.

00:13:56.803 --> 00:13:58.523
So this is going to be this,

00:13:58.523 --> 00:14:00.763
this data will be the same shape of this dummy

00:14:00.763 --> 00:14:01.923
data that we have down here.

00:14:01.923 --> 00:14:02.323
So

00:14:02.673 --> 00:14:04.383
what I'm going to do is I'm going to delete this

00:14:04.383 --> 00:14:04.743
guy.

00:14:05.543 --> 00:14:07.703
We also have a TRPC

00:14:07.873 --> 00:14:08.713
error that's thrown.

00:14:08.713 --> 00:14:10.153
So if for whatever reason

00:14:10.563 --> 00:14:11.843
we navigate to a page

00:14:12.443 --> 00:14:13.963
that doesn't have that link found,

00:14:13.963 --> 00:14:16.683
it's going to throw a TRBC not found.

00:14:16.923 --> 00:14:17.323
So

00:14:17.643 --> 00:14:19.083
if we head back over here,

00:14:19.163 --> 00:14:21.323
what we're going to notice is when this loads,

00:14:21.323 --> 00:14:23.077
we actually get that real product name.

00:14:23.077 --> 00:14:23.837
and then we actually,

00:14:23.837 --> 00:14:24.677
we should get that

00:14:24.897 --> 00:14:28.257
real default URL so we can also update this.

00:14:28.257 --> 00:14:30.177
So I'm just going to say like

00:14:30.789 --> 00:14:31.530
test.com

00:14:34.850 --> 00:14:35.907
and then we'll save it.

00:14:36.129 --> 00:14:37.489
If we reload the page,

00:14:37.569 --> 00:14:38.929
what you're going to notice is

00:14:39.159 --> 00:14:39.669
maybe that.

00:14:39.669 --> 00:14:39.989
Oh,

00:14:39.989 --> 00:14:41.069
we haven't done that one yet.

00:14:41.069 --> 00:14:41.389
Okay,

00:14:41.389 --> 00:14:41.749
sorry.

00:14:41.939 --> 00:14:44.059
but what you're going to notice here is this data

00:14:44.059 --> 00:14:45.019
is actually correct.

00:14:45.019 --> 00:14:46.659
We need to actually have these mutations.

00:14:46.659 --> 00:14:48.179
I'm kind of getting ahead of myself here.

00:14:48.179 --> 00:14:48.579
So

00:14:48.749 --> 00:14:50.699
the next thing here is we want to update the link

00:14:50.699 --> 00:14:51.059
name.

00:14:51.139 --> 00:14:51.539
So

00:14:51.749 --> 00:14:53.419
if we go to our UI project,

00:14:53.937 --> 00:14:56.137
we should be able to find the section where we

00:14:56.137 --> 00:14:58.977
have this input which contains that link name.

00:14:59.057 --> 00:15:03.017
So we can head back over to the front end of our

00:15:03.017 --> 00:15:03.377
code.

00:15:03.537 --> 00:15:05.457
I'm just going to go ahead and search for

00:15:06.097 --> 00:15:06.897
link name.

00:15:07.137 --> 00:15:08.617
And it looks like it's going to be actually

00:15:08.617 --> 00:15:10.657
layered deeper down in a component.

00:15:10.657 --> 00:15:11.057
So

00:15:12.417 --> 00:15:14.377
we can kind of like scan through here and then we

00:15:14.377 --> 00:15:16.537
can see that we have this link name editor.

00:15:16.537 --> 00:15:18.767
So this is going to be an individual component and

00:15:18.767 --> 00:15:19.767
it takes in a

00:15:20.087 --> 00:15:22.367
link info.name and it takes in an ID.

00:15:22.367 --> 00:15:24.407
So we'll go to that link editor and then what

00:15:24.407 --> 00:15:26.247
we're going to notice here is we have a mutation.

00:15:26.327 --> 00:15:27.847
So we basically say,

00:15:28.247 --> 00:15:30.367
we have a mutation on the back end that is called

00:15:30.367 --> 00:15:31.527
update link name.

00:15:32.007 --> 00:15:35.127
And this mutation is going to be used on a form

00:15:35.127 --> 00:15:35.767
submit.

00:15:35.847 --> 00:15:36.247
So

00:15:36.567 --> 00:15:38.487
essentially when a user clicks on,

00:15:38.688 --> 00:15:40.006
when a user clicks on this

00:15:41.076 --> 00:15:41.516
save.

00:15:41.516 --> 00:15:43.596
So when a user clicks on this button right here,

00:15:44.666 --> 00:15:48.026
it's going to call Handle save and Handle save is

00:15:48.026 --> 00:15:48.666
going to

00:15:50.276 --> 00:15:51.796
Handle save is going to

00:15:51.983 --> 00:15:54.083
pass in the data into this mutation.

00:15:54.723 --> 00:15:55.123
So

00:15:55.303 --> 00:15:56.223
here's what we're going to.

00:15:56.223 --> 00:15:57.223
So what we can do is

00:15:57.243 --> 00:15:58.623
it's going to pass a link ID and name.

00:15:58.623 --> 00:15:59.823
That's what we need on the backend.

00:15:59.823 --> 00:16:01.343
So let's head on over to the backend

00:16:02.303 --> 00:16:02.703
and

00:16:03.183 --> 00:16:05.423
what we see here is basically this mutation is

00:16:05.423 --> 00:16:07.183
just console logging the input.

00:16:07.183 --> 00:16:08.783
So link ID and link name.

00:16:09.023 --> 00:16:10.543
What we can do is we can say await

00:16:11.183 --> 00:16:11.823
update

00:16:12.143 --> 00:16:12.943
link name

00:16:13.983 --> 00:16:17.743
and then we can pass in the input.link ID because

00:16:17.743 --> 00:16:20.583
it takes in the link ID and it also takes in the

00:16:20.583 --> 00:16:20.863
name.

00:16:21.023 --> 00:16:24.863
So then we'll say input the new name that was

00:16:24.863 --> 00:16:25.423
defined.

00:16:25.823 --> 00:16:27.663
So now if we head over to our ui,

00:16:28.223 --> 00:16:29.703
what we can do is we can say,

00:16:29.703 --> 00:16:30.023
okay,

00:16:30.023 --> 00:16:31.343
I'm going to edit this.

00:16:31.803 --> 00:16:32.943
so when we hit edit,

00:16:32.943 --> 00:16:35.303
it toggles like an is editing state.

00:16:35.583 --> 00:16:37.023
And then we can say Product

00:16:37.583 --> 00:16:39.023
three new name.

00:16:39.823 --> 00:16:40.863
Go ahead and save that.

00:16:41.023 --> 00:16:42.743
So now when we refresh this page,

00:16:42.743 --> 00:16:44.823
we should notice that the state is actually

00:16:44.823 --> 00:16:45.503
preserved.

00:16:45.583 --> 00:16:48.743
So this is actually being updated in our database.

00:16:48.743 --> 00:16:50.063
And just to kind of prove that,

00:16:50.143 --> 00:16:53.223
we can head over to our database and we can rerun

00:16:53.223 --> 00:16:53.823
this query

00:16:54.143 --> 00:16:56.503
and what we're going to see is the name is going

00:16:56.503 --> 00:16:56.943
to be

00:16:57.343 --> 00:16:59.263
Product three new name.

00:16:59.423 --> 00:17:01.263
We can head back over to our UI

00:17:02.013 --> 00:17:02.893
and let's just,

00:17:03.053 --> 00:17:03.613
you know,

00:17:03.613 --> 00:17:06.213
give it back to Product three as the was the

00:17:06.213 --> 00:17:06.973
original name.

00:17:07.213 --> 00:17:08.253
We'll hit save.

00:17:08.333 --> 00:17:10.373
You can go to the database as well just to kind of

00:17:10.373 --> 00:17:11.213
prove that this is working.

00:17:11.453 --> 00:17:13.613
And you can see that this is now Product three.

00:17:13.773 --> 00:17:14.173
So,

00:17:14.523 --> 00:17:17.113
we're able to do this crud operation where we

00:17:17.323 --> 00:17:19.433
are able to fire a mutation query.

00:17:19.433 --> 00:17:20.953
And just if you've never used

00:17:21.063 --> 00:17:22.373
Tanstack mutations before,

00:17:22.853 --> 00:17:23.693
it's pretty cool.

00:17:23.693 --> 00:17:24.733
Like if you look at it,

00:17:24.733 --> 00:17:26.053
if we go ahead and change this,

00:17:26.953 --> 00:17:27.873
when you hit this guy,

00:17:27.873 --> 00:17:29.593
you're going to notice a request is made.

00:17:29.913 --> 00:17:32.393
This really is just a post request.

00:17:32.423 --> 00:17:33.593
there's nothing special about it.

00:17:33.593 --> 00:17:35.353
It's not like doing anything other than just a

00:17:35.353 --> 00:17:37.103
typical HTTP request.

00:17:37.713 --> 00:17:39.513
like you could copy this guy,

00:17:39.513 --> 00:17:39.863
you could

00:17:40.233 --> 00:17:42.833
copy a curl and you can actually view it as a

00:17:42.833 --> 00:17:43.353
curl.

00:17:49.197 --> 00:17:49.677
So it's just,

00:17:49.837 --> 00:17:51.557
it really is just like a Very typical

00:17:51.557 --> 00:17:53.739
it really is just like a typical HTTP request.

00:17:53.739 --> 00:17:55.219
There's nothing special about it.

00:17:55.229 --> 00:17:57.519
even though like in the code it kind of seems like

00:17:57.519 --> 00:17:59.719
a function that's part of like our JavaScript.

00:17:59.719 --> 00:18:00.279
It's just

00:18:00.598 --> 00:18:03.719
a wrapper around the HTTP request and it's able to

00:18:03.719 --> 00:18:05.009
kind of manage like that type

00:18:05.139 --> 00:18:06.499
parsing and whatnot for us.

00:18:06.499 --> 00:18:07.379
So it's pretty cool.

00:18:07.539 --> 00:18:09.099
So the last thing that we're going to want to do

00:18:09.099 --> 00:18:11.219
in terms of CRUD operations is we're going to want

00:18:11.219 --> 00:18:12.459
to enable geo routing.

00:18:12.459 --> 00:18:13.179
So we're going to,

00:18:13.179 --> 00:18:15.139
if we go over to our UI and we go back

00:18:16.389 --> 00:18:19.189
links ID page we should see that there is a

00:18:19.819 --> 00:18:21.124
geolinks toggle and

00:18:21.153 --> 00:18:23.473
And in this geolinks toggle we're going to notice

00:18:23.473 --> 00:18:25.073
that there is a mutation

00:18:25.473 --> 00:18:28.593
that we're defining as updatedestination mutation.

00:18:28.913 --> 00:18:31.153
And essentially what it's doing is it is just

00:18:31.153 --> 00:18:33.833
taking in any type of changes that we make to the

00:18:33.833 --> 00:18:36.513
georouting destinations and it's updating that on

00:18:36.513 --> 00:18:37.953
the TRPC site as well.

00:18:38.033 --> 00:18:38.433
So

00:18:38.743 --> 00:18:41.163
you can see here that we have this update links

00:18:41.163 --> 00:18:42.803
destination TRPC route.

00:18:43.373 --> 00:18:44.413
We can drill into it,

00:18:44.493 --> 00:18:46.013
head on over to our backend.

00:18:46.133 --> 00:18:50.213
so it's going to be worker TRPC route router and

00:18:50.213 --> 00:18:50.933
then links

00:18:51.253 --> 00:18:54.133
and this is our update destination links in

00:18:54.263 --> 00:18:57.303
this is our update destination links route and

00:18:57.303 --> 00:18:58.983
this is taking in an id

00:18:59.303 --> 00:19:02.263
so the given link id and it's also taking in this

00:19:02.263 --> 00:19:04.423
destination schema which we've already gone over.

00:19:04.533 --> 00:19:06.683
this is a schema that is coming from our

00:19:07.493 --> 00:19:09.613
be coming from our Data Ops package under that

00:19:09.613 --> 00:19:10.613
schema section.

00:19:10.693 --> 00:19:11.173
So it's,

00:19:11.173 --> 00:19:13.253
it's part of the package in our monorepo.

00:19:13.653 --> 00:19:15.933
Now all it's doing is it's console logging out

00:19:15.933 --> 00:19:17.093
this information that we have.

00:19:17.333 --> 00:19:19.813
So what we can do is we can say wait,

00:19:20.213 --> 00:19:20.853
update

00:19:21.413 --> 00:19:22.853
link destinations

00:19:23.072 --> 00:19:25.473
that automatically imported for us up here.

00:19:26.033 --> 00:19:26.993
Now we can,

00:19:27.696 --> 00:19:29.296
we can say let's make it,

00:19:29.296 --> 00:19:32.906
let's pass in the input.link ID

00:19:33.651 --> 00:19:36.251
and input.destinations because that's,

00:19:36.251 --> 00:19:37.811
this is the information that's required.

00:19:37.891 --> 00:19:38.291
So

00:19:38.611 --> 00:19:39.011
the,

00:19:39.091 --> 00:19:41.211
one of the things that I really love about TRPC is

00:19:41.211 --> 00:19:42.611
if you design your

00:19:42.791 --> 00:19:45.031
your types for your project in a really generic

00:19:45.031 --> 00:19:47.551
way and then you make sure that those types are

00:19:47.551 --> 00:19:48.711
used as the entry points,

00:19:48.851 --> 00:19:51.481
or the input for your queries in your package.

00:19:51.481 --> 00:19:53.841
So for your database queries and then you make

00:19:53.841 --> 00:19:55.761
sure that those database queries that the type

00:19:55.761 --> 00:19:57.801
that is returned is also like very clean.

00:19:58.121 --> 00:19:58.521
The

00:19:58.581 --> 00:20:00.091
amount of code that you have to write

00:20:00.511 --> 00:20:03.191
at this like API layer or the TRBC layer is so

00:20:03.191 --> 00:20:03.631
minimal.

00:20:03.631 --> 00:20:05.951
Like these routes are just so tight and clean.

00:20:06.111 --> 00:20:08.221
and it's just so type safe from the front end to

00:20:08.221 --> 00:20:08.701
the back end.

00:20:08.701 --> 00:20:11.021
And this pattern just makes it so easy to just

00:20:11.021 --> 00:20:13.221
scale and build these applications so quickly.

00:20:13.241 --> 00:20:14.301
like this project that I'm,

00:20:14.301 --> 00:20:15.061
that I built,

00:20:15.141 --> 00:20:16.501
I built this before actually

00:20:17.181 --> 00:20:18.441
before the filming of this course.

00:20:18.441 --> 00:20:20.641
And like I was able to do this in just a few days

00:20:20.641 --> 00:20:22.281
just because of like how

00:20:22.771 --> 00:20:24.691
how powerful these tools are that we're using.

00:20:24.691 --> 00:20:26.051
So I really hope you're enjoying

00:20:26.071 --> 00:20:27.031
the technologies that we're,

00:20:27.031 --> 00:20:28.511
that we're using if you haven't used these before.

00:20:29.311 --> 00:20:30.271
So now that we have this

00:20:30.641 --> 00:20:32.641
now that we have this mutation built for the

00:20:32.641 --> 00:20:33.121
update,

00:20:33.821 --> 00:20:35.741
for the update destinations logic,

00:20:35.741 --> 00:20:38.461
what we can see here is we have a default URL

00:20:38.781 --> 00:20:41.141
and then we have this geo routing section and this

00:20:41.141 --> 00:20:43.181
georouting section is not enabled right now.

00:20:43.341 --> 00:20:44.941
So if we go ahead and enable it

00:20:45.341 --> 00:20:48.421
we will have the ability to basically say anybody

00:20:48.421 --> 00:20:49.261
from a given country,

00:20:49.501 --> 00:20:50.381
we'll say like

00:20:50.471 --> 00:20:52.791
anybody in the United States

00:20:54.379 --> 00:20:56.539
of America is going to go to.

00:20:56.539 --> 00:20:59.419
Let's just send them to the torso.com website.

00:20:59.579 --> 00:21:01.779
obviously for our use case it probably is like

00:21:01.779 --> 00:21:02.539
product pages,

00:21:02.699 --> 00:21:04.699
like landing pages for different products for

00:21:04.699 --> 00:21:05.499
different regions.

00:21:05.799 --> 00:21:07.559
but we'll put this in there and we're going to go

00:21:07.559 --> 00:21:08.839
ahead and say save destination.

00:21:09.079 --> 00:21:11.179
We have this nice little toast that pops up

00:21:11.209 --> 00:21:12.809
as part of our SHADCN

00:21:13.059 --> 00:21:13.699
library.

00:21:13.699 --> 00:21:14.245
And then,

00:21:15.557 --> 00:21:17.957
and then you can see that we have like a

00:21:17.957 --> 00:21:19.037
destination down here.

00:21:19.037 --> 00:21:20.797
So we say everybody from the United States of

00:21:20.797 --> 00:21:22.497
America is going to go to this Torso.

00:21:22.577 --> 00:21:24.417
We can go ahead and add another destination.

00:21:24.577 --> 00:21:26.637
we're going to say everybody in Albania

00:21:27.117 --> 00:21:30.757
is going to go to this Cloudflare D1 doc page for

00:21:30.757 --> 00:21:30.997
now.

00:21:30.997 --> 00:21:32.045
So we'll put that in there.

00:21:32.045 --> 00:21:33.206
Go ahead and hit save.

00:21:33.206 --> 00:21:34.806
And you can see that we have these two.

00:21:34.886 --> 00:21:36.726
Now when we reload this page

00:21:36.807 --> 00:21:38.733
we're going to notice that these destinations are

00:21:38.733 --> 00:21:39.013
here.

00:21:39.203 --> 00:21:40.273
and then we

00:21:40.753 --> 00:21:43.633
come over to our links and you can see that it's

00:21:43.633 --> 00:21:45.633
counting the number of destinations as part of

00:21:45.633 --> 00:21:46.033
this product,

00:21:46.833 --> 00:21:47.343
as part of this

00:21:47.391 --> 00:21:47.747
this

00:21:47.747 --> 00:21:50.197
link and there's three of them and we click on it,

00:21:50.197 --> 00:21:50.957
come over here.

00:21:50.957 --> 00:21:52.717
We can see that that data is persisting.

00:21:52.717 --> 00:21:55.157
So we effectively built out these CRUD operations.

00:21:55.207 --> 00:21:56.727
we also have like a nice little

00:21:57.047 --> 00:21:57.847
pop up here.

00:21:57.847 --> 00:22:01.207
So if we decide to disable georouting and we have

00:22:01.447 --> 00:22:01.757
these

00:22:01.877 --> 00:22:02.837
links already defined,

00:22:02.837 --> 00:22:04.917
it's basically going to say like if you disable

00:22:04.917 --> 00:22:07.157
geo routing we're going to be like the links that

00:22:07.157 --> 00:22:08.677
you've already saved are going to get deleted.

00:22:08.677 --> 00:22:11.197
So when you hit disable georouting it's actually

00:22:11.197 --> 00:22:13.117
going to call that same mutation that we just

00:22:13.117 --> 00:22:15.497
defined and it's just going to put empty data in

00:22:15.497 --> 00:22:15.777
there.

00:22:15.857 --> 00:22:16.257
So

00:22:16.507 --> 00:22:18.077
we can go to the network and we can go ahead and

00:22:18.077 --> 00:22:19.237
take a look at what that looks like.

00:22:19.237 --> 00:22:19.837
Disable.

00:22:19.997 --> 00:22:21.176
So you can see that this

00:22:21.176 --> 00:22:22.217
you can see that this

00:22:24.327 --> 00:22:26.967
update link destination route was called and we

00:22:26.967 --> 00:22:29.327
passed in some data but we only passed in the

00:22:29.327 --> 00:22:30.247
default destination.

00:22:30.407 --> 00:22:32.647
So it kind of just overrode that data.

00:22:32.917 --> 00:22:34.757
so we don't have those destinations anymore.

00:22:34.757 --> 00:22:36.157
Now if you were,

00:22:36.157 --> 00:22:37.637
if you're really paying close attention,

00:22:37.637 --> 00:22:39.877
what you're going to notice is right when this

00:22:40.707 --> 00:22:42.787
right when this request was settled or was

00:22:42.837 --> 00:22:44.007
successfully fulfilled,

00:22:44.567 --> 00:22:46.247
this request fired.

00:22:46.327 --> 00:22:47.127
And if you look,

00:22:47.127 --> 00:22:50.127
this request says get link and this is actually

00:22:50.127 --> 00:22:50.487
the

00:22:50.577 --> 00:22:51.367
data call

00:22:51.368 --> 00:22:52.747
that is used to populate

00:22:53.147 --> 00:22:53.547
the

00:22:53.657 --> 00:22:54.647
data on this page.

00:22:54.647 --> 00:22:56.207
So why did this one fire?

00:22:56.207 --> 00:22:57.127
This wasn't an accident,

00:22:57.127 --> 00:22:58.567
this was actually very intentional.

00:22:58.567 --> 00:23:01.567
So if you come over here like basically if you

00:23:01.567 --> 00:23:03.207
imagine like when you disable that

00:23:03.417 --> 00:23:05.297
you're going to want to make sure like the data on

00:23:05.297 --> 00:23:07.417
the page is fresh and you could build out a bunch

00:23:07.417 --> 00:23:09.897
of like state management logic on the ui.

00:23:09.897 --> 00:23:10.297
But

00:23:10.677 --> 00:23:13.397
with the beauty of the Tanstack query is what we

00:23:13.397 --> 00:23:15.477
can do is we can head over to our UI

00:23:16.357 --> 00:23:18.277
and we will come into our

00:23:18.357 --> 00:23:20.491
we'll come into this geo routing toggle and then

00:23:20.491 --> 00:23:22.291
what you're going to notice is in this mutation

00:23:22.291 --> 00:23:23.411
where we update

00:23:23.731 --> 00:23:25.331
our destinations object,

00:23:25.811 --> 00:23:26.931
we say on success.

00:23:27.091 --> 00:23:29.211
So like when this query has successful

00:23:29.391 --> 00:23:30.271
successfully

00:23:30.511 --> 00:23:31.151
settles

00:23:31.871 --> 00:23:32.271
what,

00:23:32.431 --> 00:23:34.431
what's going to happen is we're going to take our

00:23:34.671 --> 00:23:35.391
query client,

00:23:35.391 --> 00:23:36.011
this is our

00:23:36.041 --> 00:23:37.401
Tanstack query client

00:23:37.801 --> 00:23:40.581
and we are going to invalidate qu queries.

00:23:40.821 --> 00:23:42.701
And which query are we going to invalidate?

00:23:42.701 --> 00:23:45.061
We're going to invalidate a query with the key

00:23:45.381 --> 00:23:46.421
that's coming from

00:23:46.741 --> 00:23:48.661
our get links call.

00:23:49.141 --> 00:23:51.661
And what this does is it basically says like once

00:23:51.661 --> 00:23:52.341
we hit success,

00:23:52.741 --> 00:23:53.701
we're going to say

00:23:54.101 --> 00:23:54.191
invalidate

00:23:54.641 --> 00:23:55.041
that data.

00:23:55.041 --> 00:23:58.201
And when you invalidate that data with NStack,

00:23:58.441 --> 00:24:00.881
it has to go make that data call again to get

00:24:00.881 --> 00:24:01.481
fresh data.

00:24:01.641 --> 00:24:03.921
So it's kind of like the side effect where you go

00:24:03.921 --> 00:24:05.881
update something and instead of like doing all

00:24:05.881 --> 00:24:08.001
this complicated state management globally

00:24:08.001 --> 00:24:09.561
throughout your product or your project,

00:24:09.561 --> 00:24:10.681
you can basically say,

00:24:10.681 --> 00:24:11.081
okay,

00:24:11.081 --> 00:24:11.871
I want to invalidate

00:24:12.261 --> 00:24:13.621
this data and this data and this data.

00:24:13.621 --> 00:24:15.261
So it's just going to go fetch that data from the

00:24:15.261 --> 00:24:16.781
server and just get like the fresh stuff.

00:24:16.781 --> 00:24:19.061
So it's such a snappy like clean way of doing

00:24:19.061 --> 00:24:20.421
stuff where you don't have to like worry about

00:24:20.421 --> 00:24:20.901
managing,

00:24:20.901 --> 00:24:23.061
managing state on the back end and on the front

00:24:23.061 --> 00:24:23.741
end just say,

00:24:23.741 --> 00:24:23.981
hey,

00:24:23.981 --> 00:24:26.061
I want to refresh this data and then Tanstat query

00:24:26.061 --> 00:24:26.901
takes care of it for you.

00:24:26.901 --> 00:24:27.301
It's really,

00:24:27.301 --> 00:24:27.861
really cool.

00:24:28.021 --> 00:24:28.421
So,

00:24:28.581 --> 00:24:29.021
all right,

00:24:29.021 --> 00:24:30.651
so I think that's enough for this section.

00:24:31.311 --> 00:24:33.511
we've successfully been able to have all of our

00:24:33.511 --> 00:24:34.991
CRUD operations for this product.

00:24:35.181 --> 00:24:37.031
we're able to create links,

00:24:37.351 --> 00:24:40.111
we're able to view all of the links that have been

00:24:40.111 --> 00:24:42.191
created and then we're also able to update things

00:24:42.191 --> 00:24:43.031
about that link.

00:24:43.611 --> 00:24:44.291
that's like a really.

00:24:44.291 --> 00:24:46.011
I think this is a really clean pattern of,

00:24:46.041 --> 00:24:48.031
building crud operations on

00:24:48.321 --> 00:24:50.618
Building crud operations on top of

00:24:51.248 --> 00:24:51.878
on top of

00:24:52.178 --> 00:24:53.658
applications that are running on cloudflare

00:24:53.658 --> 00:24:53.938
workers.

