WEBVTT
X-TIMESTAMP-MAP=LOCAL:00:00:00.000,MPEGTS:900000

00:00:00.103 --> 00:00:00.463
All right,

00:00:00.463 --> 00:00:02.383
so the last thing we're going to need to do inside

00:00:02.383 --> 00:00:05.703
of this UI is actually feed in real data for these

00:00:05.703 --> 00:00:06.743
analytic metrics.

00:00:06.743 --> 00:00:07.013
Now

00:00:07.013 --> 00:00:08.403
you're going to notice all of these things are

00:00:08.403 --> 00:00:09.643
mostly hard coded still.

00:00:10.283 --> 00:00:10.683
And

00:00:11.233 --> 00:00:12.883
it's going to be pretty simple to actually like

00:00:12.883 --> 00:00:14.403
wire in these analytic queries.

00:00:14.403 --> 00:00:16.843
So if you head over to User application,

00:00:16.843 --> 00:00:18.963
go to worker under trpc,

00:00:18.963 --> 00:00:20.043
we can find the

00:00:20.473 --> 00:00:21.233
links route.

00:00:21.543 --> 00:00:23.223
And what you're going to notice is we have a few

00:00:23.223 --> 00:00:25.543
of these endpoints like active links.

00:00:25.743 --> 00:00:27.303
these are links that have been

00:00:27.863 --> 00:00:29.083
clicked on very recently.

00:00:30.153 --> 00:00:33.873
we have total click in the last hour which is just

00:00:33.873 --> 00:00:35.513
going to be this metric over here

00:00:35.833 --> 00:00:37.113
and then a few other

00:00:37.923 --> 00:00:39.443
analytic metrics that we have.

00:00:39.603 --> 00:00:41.323
Essentially what we're going to want to do is

00:00:41.323 --> 00:00:42.643
build out the queries for it.

00:00:42.643 --> 00:00:43.043
So

00:00:43.663 --> 00:00:45.903
what we can do is we can CD into our

00:00:46.903 --> 00:00:48.103
Data Ops package

00:00:51.707 --> 00:00:53.867
and then I'm going to go ahead and

00:00:54.507 --> 00:00:54.907
find

00:00:55.387 --> 00:00:56.507
the file called

00:00:58.357 --> 00:00:59.877
queries links.

00:00:59.877 --> 00:01:02.677
So inside of Data Ops we have source queries

00:01:02.757 --> 00:01:03.364
links.

00:01:03.417 --> 00:01:05.377
And what we're going to want to do is we're going

00:01:05.377 --> 00:01:07.617
to want to kind of go down this list one by one

00:01:07.617 --> 00:01:08.497
and then add them.

00:01:08.497 --> 00:01:10.777
So Active Links is the first query.

00:01:11.213 --> 00:01:14.013
So we can add this specific query and we'll call

00:01:14.013 --> 00:01:14.333
this

00:01:14.973 --> 00:01:17.293
we'll call this Active Links in the last hour.

00:01:17.533 --> 00:01:20.333
And basically what this query is going to do

00:01:24.246 --> 00:01:26.006
it's going to select from our links,

00:01:26.006 --> 00:01:26.806
click table

00:01:27.286 --> 00:01:29.286
filtering by the last hour

00:01:30.006 --> 00:01:32.486
and also of course filtering on the account ID or

00:01:32.486 --> 00:01:33.126
the user id

00:01:33.446 --> 00:01:35.766
and then it's going to aggregate by the link ID

00:01:35.766 --> 00:01:36.806
and the link name

00:01:37.126 --> 00:01:39.846
and it will be showing the click count,

00:01:40.686 --> 00:01:42.686
and it will also be showing the

00:01:43.006 --> 00:01:44.286
max clicked time.

00:01:44.286 --> 00:01:46.126
So the last time it was clicked,

00:01:47.046 --> 00:01:49.485
we can go ahead and say pmpm run

00:01:49.885 --> 00:01:50.285
build

00:01:50.925 --> 00:01:52.045
should build out this

00:01:52.066 --> 00:01:52.856
query for us

00:01:52.856 --> 00:01:54.201
and then we can

00:01:56.041 --> 00:01:58.361
make sure we save before we build obviously.

00:01:59.244 --> 00:02:01.418
And it looks like I actually haven't imported the

00:02:01.418 --> 00:02:02.559
SQL statement from

00:02:02.559 --> 00:02:03.478
Drizzle orm.

00:02:03.478 --> 00:02:04.438
So we'll go ahead and do that

00:02:05.318 --> 00:02:06.518
and build one more time.

00:02:07.402 --> 00:02:07.562
Cool.

00:02:07.562 --> 00:02:08.282
That Bill went through.

00:02:08.282 --> 00:02:10.762
So let's head over to Links and then remove this

00:02:10.762 --> 00:02:11.482
dummy data,

00:02:12.994 --> 00:02:14.998
import this from our Data ops

00:02:15.245 --> 00:02:17.045
and then we're going to want to make sure we pass

00:02:17.045 --> 00:02:18.045
in the user ID

00:02:18.365 --> 00:02:20.525
as the prop so we can say context

00:02:20.624 --> 00:02:22.177
and we will pass in

00:02:22.577 --> 00:02:24.413
ctx.user

00:02:24.821 --> 00:02:27.377
info.user ID here.

00:02:27.919 --> 00:02:29.639
Now we head down here and we're going to say there

00:02:29.639 --> 00:02:31.119
is no active link clicks.

00:02:32.319 --> 00:02:34.239
So if we head over to our Links.

00:02:34.239 --> 00:02:34.639
And

00:02:35.179 --> 00:02:36.619
notice this is still undefined.

00:02:36.619 --> 00:02:39.419
We'll be adding out a URL as an environment

00:02:39.419 --> 00:02:40.459
variable very soon.

00:02:40.539 --> 00:02:40.939
But

00:02:41.259 --> 00:02:42.459
we could just say

00:02:42.905 --> 00:02:43.663
let's do

00:02:44.263 --> 00:02:45.143
let's open this up.

00:02:45.863 --> 00:02:46.743
Let's just say

00:02:47.383 --> 00:02:47.783
go

00:02:48.263 --> 00:02:48.823
stage,

00:02:49.303 --> 00:02:50.183
put that in.

00:02:50.410 --> 00:02:51.850
Just make sure that I copied the

00:02:52.170 --> 00:02:53.210
right URL.

00:02:53.210 --> 00:02:54.250
We'll say go

00:02:55.770 --> 00:02:56.330
stage,

00:02:56.650 --> 00:02:57.450
put that in.

00:02:57.530 --> 00:02:58.650
This should redirect.

00:02:58.650 --> 00:02:59.050
Cool.

00:02:59.050 --> 00:03:00.010
That redirected.

00:03:00.730 --> 00:03:01.130
And

00:03:01.690 --> 00:03:02.090
now

00:03:02.569 --> 00:03:04.090
when we head over to

00:03:04.890 --> 00:03:06.690
Dashboard let's see if we get some.

00:03:06.690 --> 00:03:06.930
Yeah,

00:03:06.930 --> 00:03:07.330
there we go.

00:03:07.330 --> 00:03:07.690
So

00:03:08.030 --> 00:03:10.030
this is now showing up whenever we actually get a

00:03:10.030 --> 00:03:10.470
link click.

00:03:10.470 --> 00:03:12.670
It'll show how many link clicks we got in the last

00:03:12.940 --> 00:03:14.890
hour and then also it's going to show the last

00:03:14.890 --> 00:03:16.690
time that it was clicked so seven seconds ago,

00:03:16.690 --> 00:03:16.870
which,

00:03:16.940 --> 00:03:17.438
which is pretty cool.

00:03:17.572 --> 00:03:19.332
So now let's head through the

00:03:19.942 --> 00:03:21.222
these queries pretty quickly.

00:03:21.222 --> 00:03:23.302
So we're going to say total link clicks in the

00:03:23.302 --> 00:03:24.102
last hour.

00:03:25.482 --> 00:03:27.242
what we're going to do is we're going to.

00:03:28.122 --> 00:03:29.561
I'll copy this guy in.

00:03:33.402 --> 00:03:35.802
So head over to our queries and let's say

00:03:36.202 --> 00:03:37.482
this is going to be

00:03:38.672 --> 00:03:39.912
total link looks in the last hours.

00:03:39.912 --> 00:03:40.992
What we'll call the method.

00:03:41.072 --> 00:03:44.312
Basically it's going to also go back one hour and

00:03:44.312 --> 00:03:46.752
then it's just going to filter by that hour and

00:03:46.752 --> 00:03:48.952
the account ID and it's just going to count all

00:03:48.952 --> 00:03:49.312
together.

00:03:50.032 --> 00:03:50.672
Save that.

00:03:51.392 --> 00:03:51.422
Let's

00:03:51.652 --> 00:03:52.532
do another one.

00:03:52.612 --> 00:03:55.732
For this like last 24 hours it's going to be a

00:03:55.732 --> 00:03:56.932
very similar query.

00:03:59.674 --> 00:04:01.434
I do think we could actually lump

00:04:01.498 --> 00:04:03.368
this together so these can kind of come through

00:04:03.368 --> 00:04:04.008
one query.

00:04:04.328 --> 00:04:04.728
So

00:04:05.048 --> 00:04:07.648
what we can do is we can basically say let's

00:04:07.648 --> 00:04:11.448
create a function called get last 24 and 48 hour

00:04:11.448 --> 00:04:13.248
clicks and we're going to set two different

00:04:13.248 --> 00:04:14.008
filters here.

00:04:14.578 --> 00:04:15.938
and then what we're going to do is we're going to

00:04:15.938 --> 00:04:16.818
do a case statement

00:04:17.105 --> 00:04:20.065
that looks at the click time and then just does an

00:04:20.065 --> 00:04:21.025
in place filter

00:04:21.725 --> 00:04:24.965
of the last 48 hours and then also the last 24

00:04:24.965 --> 00:04:25.325
hours.

00:04:25.405 --> 00:04:28.045
So essentially we're just going to have one filter

00:04:28.045 --> 00:04:30.405
in here at the base level that's going to scan the

00:04:30.405 --> 00:04:31.765
last 48 hours worth of data.

00:04:31.765 --> 00:04:33.805
And then obviously if like your data was huge and

00:04:33.805 --> 00:04:35.645
like you had like an enterprise account that had

00:04:35.885 --> 00:04:37.044
millions and millions of records,

00:04:37.044 --> 00:04:38.525
you probably move to like a different

00:04:38.845 --> 00:04:40.575
link clicks type of analytics,

00:04:40.955 --> 00:04:42.555
platform to kind of store that data.

00:04:42.555 --> 00:04:44.435
But for the purpose of this I think it's way

00:04:44.435 --> 00:04:45.225
beyond the scope.

00:04:45.485 --> 00:04:45.845
yeah,

00:04:45.845 --> 00:04:47.285
so we're going to scan the last two days worth of

00:04:47.285 --> 00:04:49.885
data and we'll just do these in place filters

00:04:49.885 --> 00:04:50.205
here,

00:04:50.668 --> 00:04:51.548
go ahead and save that.

00:04:52.108 --> 00:04:54.988
And we also have this metric for getting the last

00:04:55.148 --> 00:04:56.328
30 days worth of

00:04:56.918 --> 00:04:57.758
link clicks.

00:04:57.758 --> 00:05:01.478
So again we'll just have another one called

00:05:01.878 --> 00:05:03.562
get last 30 days clicks

00:05:03.562 --> 00:05:05.584
and that's just going to set a filter for 30 days,

00:05:05.984 --> 00:05:06.864
do another count.

00:05:06.944 --> 00:05:09.184
And a lot of these queries are kind of like,

00:05:09.984 --> 00:05:11.864
they're kind of like redundant.

00:05:11.864 --> 00:05:14.064
Like this is very similar to the last 24 hours.

00:05:14.064 --> 00:05:16.784
So realistically if we wanted to we could probably

00:05:16.944 --> 00:05:19.104
have this as like a generic method and then we

00:05:19.104 --> 00:05:19.414
could pass,

00:05:19.484 --> 00:05:21.564
pass in a date filter at the top level.

00:05:21.564 --> 00:05:23.164
But we're not going to worry about that now.

00:05:23.164 --> 00:05:25.084
Just know like if you wanted to clean things up,

00:05:25.314 --> 00:05:26.534
you could make these a lot,

00:05:26.884 --> 00:05:28.524
you know like a lot more generic

00:05:28.524 --> 00:05:29.304
and reusable.

00:05:29.944 --> 00:05:32.104
Now we'll do another one for

00:05:32.464 --> 00:05:34.344
The last thing I think we have is

00:05:34.664 --> 00:05:35.064
this,

00:05:35.304 --> 00:05:35.644
this

00:05:35.714 --> 00:05:37.554
metric right here which is

00:05:37.874 --> 00:05:40.194
top countries and essentially what we're going to

00:05:40.194 --> 00:05:42.274
say is it's going to group by country

00:05:42.834 --> 00:05:45.034
and it's going to show the number of link clicks

00:05:45.034 --> 00:05:48.114
and the percentage of the total link clicks that

00:05:48.114 --> 00:05:49.474
are attributed to a given country.

00:05:50.222 --> 00:05:52.650
So we can go ahead and create a method called get

00:05:53.130 --> 00:05:53.930
30 days

00:05:54.250 --> 00:05:54.650
link,

00:05:54.650 --> 00:05:55.450
click by country

00:05:57.267 --> 00:05:57.407
and

00:05:57.407 --> 00:05:59.167
All it's going to do is filter by the last 30

00:05:59.167 --> 00:05:59.487
days,

00:05:59.567 --> 00:06:02.407
group by country and then do account and make sure

00:06:02.407 --> 00:06:04.727
we're filtering by account ID and then also the 30

00:06:04.727 --> 00:06:05.087
days.

00:06:05.087 --> 00:06:06.287
So I'm going to go ahead and

00:06:07.647 --> 00:06:10.367
we can go ahead and build PNPM run

00:06:10.927 --> 00:06:11.327
build

00:06:11.714 --> 00:06:13.179
should build out those queries for us.

00:06:13.179 --> 00:06:15.322
Now we can head over to our router

00:06:15.737 --> 00:06:17.857
and I'm just going to go ahead and copy this stuff

00:06:17.857 --> 00:06:18.137
in.

00:06:18.297 --> 00:06:18.697
So

00:06:20.048 --> 00:06:22.328
total link clicks in the last hour is going to use

00:06:22.328 --> 00:06:22.928
this method,

00:06:23.008 --> 00:06:24.368
import it from data ops.

00:06:24.608 --> 00:06:27.408
Last 24 hour link clicks which this is honestly a

00:06:27.408 --> 00:06:27.808
bad name.

00:06:27.808 --> 00:06:29.928
I think I wrote this and then I added another

00:06:29.928 --> 00:06:30.608
metric later.

00:06:30.608 --> 00:06:32.128
So you could change that if you want.

00:06:33.508 --> 00:06:34.628
we'll import this query

00:06:35.028 --> 00:06:36.548
last 30 day clicks

00:06:38.788 --> 00:06:40.468
and then clicks by country.

00:06:43.108 --> 00:06:43.588
Cool.

00:06:43.748 --> 00:06:44.468
Save that.

00:06:44.788 --> 00:06:47.068
Now we should look at our dashboard and we should

00:06:47.068 --> 00:06:47.428
see.

00:06:47.508 --> 00:06:48.068
Yep,

00:06:48.068 --> 00:06:50.628
these queries are actually coming from trpc,

00:06:50.628 --> 00:06:53.388
so United States of America to link clicks.

00:06:53.388 --> 00:06:54.708
Link clicks in the last hour.

00:06:55.518 --> 00:06:57.358
and then we have link clicks in the last 30 days.

00:06:57.820 --> 00:06:59.900
Now let's head over to our

00:07:00.930 --> 00:07:03.330
links and you notice this shows as undefined.

00:07:03.330 --> 00:07:05.250
We can go ahead and we can fix that.

00:07:05.490 --> 00:07:05.766
So

00:07:05.766 --> 00:07:08.794
heading over to the UI in the user application,

00:07:08.794 --> 00:07:11.575
I'm just going to do a bulk search for some text

00:07:11.575 --> 00:07:13.295
that we see in the

00:07:13.615 --> 00:07:14.255
actual,

00:07:14.925 --> 00:07:15.565
ui.

00:07:15.725 --> 00:07:17.325
And that's going to bring us to here.

00:07:18.127 --> 00:07:21.327
Now we can see we have this column helper with the

00:07:21.327 --> 00:07:22.287
header of link.

00:07:22.367 --> 00:07:23.567
So it's this one right here.

00:07:23.807 --> 00:07:26.287
And we are pulling in a environment

00:07:26.767 --> 00:07:28.767
variable called vite backend host.

00:07:29.327 --> 00:07:33.287
Now let's just go ahead and in our EMV file for

00:07:33.287 --> 00:07:34.127
user application,

00:07:34.127 --> 00:07:35.247
let's go ahead and add that.

00:07:35.247 --> 00:07:37.327
So I'm just going to say this is,

00:07:37.567 --> 00:07:39.557
vite back and host is going to be

00:07:40.277 --> 00:07:42.757
go-stage.

00:07:43.587 --> 00:07:44.067
Smart

00:07:45.106 --> 00:07:47.274
smartlink.com is the base.

00:07:47.487 --> 00:07:48.847
So now we have that in here

00:07:49.327 --> 00:07:49.967
copy

00:07:50.447 --> 00:07:52.087
and we should be able to redirect.

00:07:52.087 --> 00:07:53.327
So that's working perfect.

00:07:53.327 --> 00:07:57.327
And then just make sure we also add this variable.

00:07:57.839 --> 00:08:00.639
we also add this variable inside of our

00:08:01.016 --> 00:08:02.936
worker config for the build.

00:08:03.016 --> 00:08:04.376
So for our automated build,

00:08:04.936 --> 00:08:06.736
we're going to want to make sure we have this as

00:08:06.736 --> 00:08:06.936
well.

00:08:06.936 --> 00:08:07.416
So we'll,

00:08:07.416 --> 00:08:09.816
we should do it for both the stage and the

00:08:09.816 --> 00:08:11.096
production version of this app.

00:08:11.096 --> 00:08:12.296
So go over to settings.

00:08:12.696 --> 00:08:15.656
These are our build time variables right here.

00:08:16.056 --> 00:08:18.536
And we can just go ahead and add this one.

00:08:18.616 --> 00:08:19.016
So

00:08:19.336 --> 00:08:19.976
we want

00:08:20.081 --> 00:08:21.452
this base one.

00:08:24.970 --> 00:08:27.930
I'll also update the production version here.

00:08:28.890 --> 00:08:31.570
And this is just going to be go smartlink.com as

00:08:31.570 --> 00:08:32.169
the base.

00:08:32.170 --> 00:08:32.650
Cool.

00:08:32.970 --> 00:08:33.530
All right,

00:08:33.610 --> 00:08:36.410
so now we have a fully functioning ui,

00:08:36.410 --> 00:08:39.010
has all the features built out and actual live

00:08:39.010 --> 00:08:40.810
data that are coming from link clicks.

00:08:40.810 --> 00:08:41.210
So

00:08:41.956 --> 00:08:43.396
that's going to wrap things up for

00:08:43.796 --> 00:08:44.076
like,

00:08:44.076 --> 00:08:46.796
the core focus of the course and the UI and

00:08:46.796 --> 00:08:47.276
whatnot.

00:08:47.596 --> 00:08:49.956
I'm going to move a little bit into some stretch

00:08:49.956 --> 00:08:51.436
goals and then maybe a little bit of like,

00:08:51.436 --> 00:08:53.356
theory around how to test this application,

00:08:53.436 --> 00:08:55.036
writing unit tests and whatnot.

00:08:55.276 --> 00:08:56.596
But I really hope you've enjoyed,

00:08:56.596 --> 00:08:57.596
what we've done so far,

00:08:57.596 --> 00:08:58.996
because I do think we've built something that's

00:08:58.996 --> 00:08:59.516
pretty cool.

00:08:59.516 --> 00:09:01.316
And at this point I really hope you've learned a

00:09:01.316 --> 00:09:01.996
ton about,

00:09:02.361 --> 00:09:04.681
about not only how to ship on Cloudflare and use

00:09:04.681 --> 00:09:06.121
like the compute primitives,

00:09:06.121 --> 00:09:07.361
but also you know,

00:09:07.361 --> 00:09:07.961
how to like,

00:09:08.041 --> 00:09:10.041
build out an entire product end to end.

00:09:10.581 --> 00:09:11.181
As you've noticed,

00:09:11.181 --> 00:09:11.581
like this,

00:09:11.581 --> 00:09:13.901
the service is really modular and we're able to

00:09:13.901 --> 00:09:15.861
extend really easily by this design.

00:09:15.941 --> 00:09:17.501
So I hope you've learned something and I hope that

00:09:17.501 --> 00:09:18.741
this course was useful for you.

