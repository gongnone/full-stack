WEBVTT
X-TIMESTAMP-MAP=LOCAL:00:00:00.000,MPEGTS:900000

00:00:00.066 --> 00:00:00.626
Alright,

00:00:00.626 --> 00:00:02.066
so let's enhance the

00:00:02.386 --> 00:00:05.146
durable object to contain the business logic

00:00:05.146 --> 00:00:07.906
needed to manage the running of our evaluation

00:00:07.906 --> 00:00:08.546
workflow.

00:00:08.546 --> 00:00:10.146
So the very first thing that I'm going to do here

00:00:10.146 --> 00:00:11.666
is delete this.

00:00:11.666 --> 00:00:13.026
We no longer need

00:00:13.346 --> 00:00:14.706
this specific route.

00:00:14.706 --> 00:00:16.546
It's just kind of a dummy temporary route.

00:00:17.016 --> 00:00:19.126
this is just going to clean things up and let's

00:00:19.126 --> 00:00:19.966
delete count,

00:00:20.366 --> 00:00:21.566
and let's delete

00:00:21.913 --> 00:00:23.673
Any other reference to count here.

00:00:23.673 --> 00:00:27.193
We also don't need increment or get count anymore.

00:00:27.673 --> 00:00:30.633
So essentially what we want is we want to build a

00:00:30.633 --> 00:00:32.953
durable object that fits into the system this way.

00:00:32.953 --> 00:00:36.233
So imagine you have some user over here and this

00:00:36.233 --> 00:00:36.793
user

00:00:37.143 --> 00:00:39.903
clicks on a link and it goes to our Hono API.

00:00:39.903 --> 00:00:41.463
And our Hono API looks up

00:00:41.783 --> 00:00:45.703
the specific redirect URL for that given link id.

00:00:46.413 --> 00:00:49.093
it redirects that user so that user is able to

00:00:49.093 --> 00:00:50.093
basically say okay yeah,

00:00:50.093 --> 00:00:50.923
I'm going to go to this

00:00:51.283 --> 00:00:53.603
new destination and in the background we're

00:00:53.603 --> 00:00:55.803
writing some information to the queue and we're

00:00:55.803 --> 00:00:57.963
writing this specific information to the queue.

00:00:57.963 --> 00:00:58.563
We're saying

00:00:59.313 --> 00:01:02.433
we're passing in the country the destination which

00:01:02.433 --> 00:01:04.873
is the actual like redirect URL,

00:01:04.873 --> 00:01:05.793
the account id,

00:01:05.793 --> 00:01:06.393
latitude,

00:01:06.393 --> 00:01:06.832
longitude,

00:01:06.832 --> 00:01:08.273
some other additional information here.

00:01:08.673 --> 00:01:10.413
that information is going onto our queue,

00:01:10.413 --> 00:01:12.533
it's being saved in a database and then,

00:01:12.613 --> 00:01:14.173
or it's being picked up by a consumer,

00:01:14.173 --> 00:01:15.973
it's being saved into a database and then

00:01:16.603 --> 00:01:18.203
from there we're going to want to build some

00:01:18.203 --> 00:01:18.603
extra,

00:01:18.603 --> 00:01:22.643
some extra logic and that the new bit of logic

00:01:22.643 --> 00:01:25.003
that we're going to be adding is this durable

00:01:25.003 --> 00:01:26.043
object that

00:01:26.363 --> 00:01:29.763
basically looks at a given destination URL and

00:01:29.763 --> 00:01:31.683
then is able to run a workflow based upon that

00:01:31.683 --> 00:01:32.843
destination URL.

00:01:32.843 --> 00:01:33.243
So

00:01:33.783 --> 00:01:35.983
from here we can build out business logic to say

00:01:35.983 --> 00:01:36.223
hey,

00:01:36.223 --> 00:01:37.303
whenever we get a link,

00:01:37.303 --> 00:01:37.663
click,

00:01:37.663 --> 00:01:39.903
let's wait three days or let's wait two minutes or

00:01:39.903 --> 00:01:40.903
let's wait seven days.

00:01:41.543 --> 00:01:43.463
Let's check if the user is

00:01:44.443 --> 00:01:44.683
of,

00:01:44.923 --> 00:01:46.923
is a premium user and they're paying for the

00:01:46.923 --> 00:01:48.363
service because maybe you could say like

00:01:48.363 --> 00:01:49.963
evaluations are only a

00:01:50.893 --> 00:01:51.773
a premium

00:01:52.413 --> 00:01:52.423
feature,

00:01:52.673 --> 00:01:53.673
within the application.

00:01:53.673 --> 00:01:56.273
So this is kind of where all that logic can live

00:01:56.273 --> 00:01:58.793
and it can be very self contained and easy to

00:01:58.793 --> 00:01:59.793
manage and roll out.

00:01:59.953 --> 00:02:02.193
So what we're going to want to do is we're going

00:02:02.193 --> 00:02:03.873
to want to head back over to our evaluation

00:02:03.953 --> 00:02:06.273
scheduler and then I have an interface that we,

00:02:06.273 --> 00:02:07.313
that I've created

00:02:07.793 --> 00:02:08.193
called

00:02:08.873 --> 00:02:09.453
click data

00:02:10.173 --> 00:02:12.573
and this just contains some specific information

00:02:12.893 --> 00:02:14.750
about a given link click,

00:02:14.901 --> 00:02:16.021
we get an account ID

00:02:16.341 --> 00:02:17.061
Link id,

00:02:17.221 --> 00:02:18.501
destination URL,

00:02:18.581 --> 00:02:20.181
destination country code.

00:02:20.591 --> 00:02:22.191
now what we're going to want to do is we're going

00:02:22.191 --> 00:02:24.351
to want to define a top level property of this

00:02:24.351 --> 00:02:24.671
class

00:02:25.151 --> 00:02:25.551
called

00:02:26.131 --> 00:02:26.851
click data,

00:02:26.851 --> 00:02:29.011
which is either of this type click data

00:02:29.411 --> 00:02:30.863
or it is undefined.

00:02:31.146 --> 00:02:33.146
Now we can also inside of this

00:02:33.749 --> 00:02:35.909
inside of our block concurrency while

00:02:36.229 --> 00:02:37.509
we can go grab that data.

00:02:37.909 --> 00:02:38.309
And

00:02:39.029 --> 00:02:41.429
when this durable object is utilized for the very

00:02:41.429 --> 00:02:41.949
first time,

00:02:41.949 --> 00:02:43.509
this is going to be undefined,

00:02:43.509 --> 00:02:47.149
which is why we have it of the type click data or

00:02:47.149 --> 00:02:47.909
undefined.

00:02:48.389 --> 00:02:51.349
Now we can add an additional method to this class

00:02:51.589 --> 00:02:51.989
called

00:02:52.529 --> 00:02:53.690
Collect link click.

00:02:54.496 --> 00:02:56.606
Now collect link click is going to take

00:02:56.606 --> 00:02:57.642
a account id,

00:02:57.722 --> 00:02:58.482
a link id,

00:02:58.482 --> 00:03:01.082
a destination URL and a destination country code.

00:03:01.082 --> 00:03:02.652
The same information that's going to go here.

00:03:02.652 --> 00:03:03.198
And then

00:03:03.758 --> 00:03:05.918
we can just kind of prepare this information

00:03:06.318 --> 00:03:06.958
in a

00:03:08.119 --> 00:03:08.619
variable

00:03:08.664 --> 00:03:10.340
and then let's just say,

00:03:10.980 --> 00:03:13.380
let's just save this into our in memory object.

00:03:13.380 --> 00:03:13.607
So

00:03:13.607 --> 00:03:14.027
you know what,

00:03:14.027 --> 00:03:15.947
what we could probably do is we could probably

00:03:15.947 --> 00:03:16.747
just go like this,

00:03:17.067 --> 00:03:18.587
keep it a little bit more clean.

00:03:19.869 --> 00:03:20.349
Okay.

00:03:21.069 --> 00:03:21.709
And then

00:03:22.189 --> 00:03:25.469
so we're basically saving this data into our

00:03:25.469 --> 00:03:26.029
clink,

00:03:26.109 --> 00:03:27.069
click data,

00:03:28.329 --> 00:03:28.969
property

00:03:29.369 --> 00:03:30.409
that is in memory.

00:03:30.729 --> 00:03:32.649
And then we're also going to want to make sure we

00:03:32.649 --> 00:03:33.849
flush this to

00:03:35.319 --> 00:03:36.919
we flush this to storage.

00:03:36.999 --> 00:03:37.310
So

00:03:39.072 --> 00:03:40.592
make sure we reference this.

00:03:40.752 --> 00:03:43.152
So we're setting this data and then we're passing

00:03:43.152 --> 00:03:44.912
it into our storage.

00:03:45.270 --> 00:03:47.341
Now once we have this information saved,

00:03:47.341 --> 00:03:48.301
what do we do?

00:03:48.541 --> 00:03:48.941
Like

00:03:49.341 --> 00:03:51.181
we're going to want to run a workflow.

00:03:51.421 --> 00:03:53.701
Now we could just basically like come into here

00:03:53.701 --> 00:03:55.421
and say this.emv.

00:03:57.985 --> 00:04:00.265
and in order to get our type hinting,

00:04:00.265 --> 00:04:02.785
we're going to want to make sure we pass our EMV

00:04:02.865 --> 00:04:05.065
as a generic at the top level of this.

00:04:05.065 --> 00:04:06.625
So we can basically say emv.

00:04:07.505 --> 00:04:09.585
Now what we're able to do is we're able to say

00:04:12.245 --> 00:04:12.965
evaluation,

00:04:14.405 --> 00:04:15.085
what do we call it?

00:04:15.085 --> 00:04:17.605
Evaluation workflow I think was the name

00:04:19.225 --> 00:04:20.945
Destination evaluation workflow.

00:04:20.945 --> 00:04:22.985
And then we could say create and we could run,

00:04:23.065 --> 00:04:24.745
we could pass in some data into here.

00:04:24.745 --> 00:04:25.145
Now

00:04:25.465 --> 00:04:25.865
this,

00:04:26.025 --> 00:04:26.505
you know,

00:04:26.505 --> 00:04:27.225
like would work,

00:04:27.225 --> 00:04:29.345
but basically what would happen is we'd be running

00:04:29.345 --> 00:04:29.625
this

00:04:29.796 --> 00:04:31.874
workflow every single link click that we got and

00:04:31.874 --> 00:04:34.034
it would be expensive and really unnecessary.

00:04:34.034 --> 00:04:37.034
So this is the perfect use case for alarms where

00:04:37.034 --> 00:04:39.514
we could get some data in our durable object and

00:04:39.514 --> 00:04:40.674
then we can manage and say,

00:04:40.674 --> 00:04:41.074
hey,

00:04:41.074 --> 00:04:43.354
in two days from now and five days from now and 10

00:04:43.354 --> 00:04:44.034
minutes from now,

00:04:44.484 --> 00:04:45.444
I want to run

00:04:46.074 --> 00:04:48.954
an alarm that like executes some code and the code

00:04:48.954 --> 00:04:50.754
that's going to be executed is the creation of

00:04:50.754 --> 00:04:51.594
that workflow,

00:04:51.674 --> 00:04:51.954
so,

00:04:51.954 --> 00:04:52.234
or

00:04:52.714 --> 00:04:55.314
of that specific destination evaluation workflow.

00:04:55.314 --> 00:04:55.674
So,

00:04:55.984 --> 00:04:56.638
what we could do

00:04:56.914 --> 00:04:59.154
is we can grab our alarm.

00:04:59.394 --> 00:05:01.794
So inside of the context,

00:05:02.994 --> 00:05:04.194
inside of storage,

00:05:04.434 --> 00:05:05.234
there's also

00:05:05.554 --> 00:05:05.954
this,

00:05:06.394 --> 00:05:06.874
property

00:05:07.534 --> 00:05:08.294
called alarm.

00:05:08.294 --> 00:05:10.414
And we can get the alarm

00:05:10.894 --> 00:05:13.854
and this is going to be a number or it's going to

00:05:13.854 --> 00:05:14.374
be null.

00:05:14.374 --> 00:05:15.254
And if it's null,

00:05:15.254 --> 00:05:17.814
that means no alarm is currently set for this

00:05:17.814 --> 00:05:18.734
durable object.

00:05:18.814 --> 00:05:20.894
So if there is no alarm,

00:05:23.820 --> 00:05:25.380
what we can do is we can say,

00:05:25.380 --> 00:05:28.060
let's wait a certain period of time from now.

00:05:28.060 --> 00:05:29.320
So I can say constant,

00:05:30.080 --> 00:05:30.320
10

00:05:31.022 --> 00:05:31.742
seconds.

00:05:31.864 --> 00:05:34.904
And I'm using a moment library.

00:05:34.904 --> 00:05:38.344
You can use like date dot now and then you can

00:05:38.344 --> 00:05:38.584
like,

00:05:38.584 --> 00:05:39.064
plus,

00:05:39.224 --> 00:05:39.784
you know,

00:05:40.264 --> 00:05:41.304
however many,

00:05:41.744 --> 00:05:42.324
however many,

00:05:42.324 --> 00:05:42.684
like

00:05:43.164 --> 00:05:45.804
epoch milliseconds are going to be,

00:05:45.884 --> 00:05:46.324
you know,

00:05:46.324 --> 00:05:47.724
10 seconds from the current time.

00:05:47.884 --> 00:05:50.204
But moment makes it a lot easier in my opinion.

00:05:50.204 --> 00:05:51.724
So we can say moment,

00:05:52.744 --> 00:05:53.784
and then I'm going to say

00:05:54.184 --> 00:05:56.184
this means moment dot now and this is going to be

00:05:56.184 --> 00:05:58.024
in utc and we can say add,

00:05:58.944 --> 00:06:00.704
three or let's add ten.

00:06:01.424 --> 00:06:03.824
And the unit is going to be seconds.

00:06:05.024 --> 00:06:06.464
And then what you want to do,

00:06:06.464 --> 00:06:08.064
because this is not going to be,

00:06:08.064 --> 00:06:09.664
this is going to be a type moment,

00:06:09.744 --> 00:06:11.744
we're going to need to make sure we say value of

00:06:11.904 --> 00:06:13.624
and that's going to convert that into like an

00:06:13.624 --> 00:06:14.544
epoch milli

00:06:14.584 --> 00:06:15.084
timestamp,

00:06:15.084 --> 00:06:16.684
which is a numeric value.

00:06:17.164 --> 00:06:19.244
Then the last thing you do is you say await

00:06:19.864 --> 00:06:23.104
this.uhctx.uhstorage.

00:06:23.104 --> 00:06:25.864
set alarm and then you're going to pass in this

00:06:25.864 --> 00:06:26.184
time.

00:06:26.184 --> 00:06:28.664
So right now we're just adding an alarm 10 seconds

00:06:28.664 --> 00:06:29.064
from now,

00:06:29.304 --> 00:06:29.944
and then,

00:06:30.424 --> 00:06:30.684
later,

00:06:30.684 --> 00:06:31.084
you know,

00:06:31.084 --> 00:06:32.324
we're going to kind of tweak this time.

00:06:32.324 --> 00:06:32.644
Now,

00:06:32.884 --> 00:06:33.684
this logic,

00:06:33.684 --> 00:06:35.484
you could like set an alarm and you could

00:06:35.484 --> 00:06:37.364
basically check if the user is paid or not.

00:06:37.744 --> 00:06:38.944
you do a lot of stuff here.

00:06:39.024 --> 00:06:41.904
Or you could also push that into the alarm

00:06:41.904 --> 00:06:42.184
function,

00:06:42.184 --> 00:06:43.464
which we're going to build out right now.

00:06:43.464 --> 00:06:45.024
There's a lot of different ways of doing this.

00:06:45.024 --> 00:06:46.624
I'm just kind of keeping this simple just so you

00:06:46.624 --> 00:06:47.024
can understand,

00:06:47.104 --> 00:06:48.144
like add,

00:06:48.574 --> 00:06:49.214
a base level,

00:06:49.694 --> 00:06:51.454
what the alarm is and how to use it.

00:06:51.454 --> 00:06:54.734
So now let's actually utilize the alarm method.

00:06:55.184 --> 00:06:57.984
so if we want to capture when this alarm fires 10

00:06:57.984 --> 00:06:59.024
seconds into the future,

00:06:59.424 --> 00:07:00.944
what we're going to want to do is we're going to

00:07:00.944 --> 00:07:02.944
want to capture that so we can say alarm.

00:07:03.424 --> 00:07:05.824
And you do get some additional properties like you

00:07:05.824 --> 00:07:07.704
can pass in some alarm information here.

00:07:07.704 --> 00:07:09.504
We're not going to really worry about that.

00:07:09.824 --> 00:07:12.184
We're just going to be triggering the alarm and

00:07:12.184 --> 00:07:14.704
then we can basically say console log,

00:07:16.139 --> 00:07:18.379
the evaluation scheduler alarm triggered.

00:07:18.539 --> 00:07:18.939
So

00:07:19.769 --> 00:07:21.539
from there it's basically going to say,

00:07:21.539 --> 00:07:21.899
all right,

00:07:21.899 --> 00:07:22.659
we're going to

00:07:23.139 --> 00:07:25.819
run this code when the alarm triggers 10 seconds

00:07:25.819 --> 00:07:26.420
into the future

00:07:26.791 --> 00:07:27.071
now.

00:07:27.071 --> 00:07:28.391
So when this alarm fires,

00:07:28.711 --> 00:07:30.471
we can trigger this,

00:07:30.471 --> 00:07:31.671
we can trigger our workflow.

00:07:31.671 --> 00:07:35.031
So we can say await this EMV.

00:07:35.831 --> 00:07:37.671
destination evaluation workflow.

00:07:37.671 --> 00:07:40.391
So we're grabbing our workflow that runs all of

00:07:40.391 --> 00:07:42.551
the steps to actually check if a web page is

00:07:42.551 --> 00:07:43.191
healthy or not.

00:07:43.351 --> 00:07:43.911
And then

00:07:44.211 --> 00:07:46.851
in order to programmatically trigger the workflow,

00:07:47.091 --> 00:07:48.211
you can say create.

00:07:49.011 --> 00:07:51.171
Now what we're going to notice here is create

00:07:52.051 --> 00:07:54.451
is basically saying you have like the,

00:07:54.451 --> 00:07:56.931
you have optional options into here and

00:07:57.491 --> 00:07:59.891
the workflow create options are unknown.

00:07:59.970 --> 00:08:01.571
Now the reason why it's unknown

00:08:01.891 --> 00:08:03.771
because technically we are going to be passing in

00:08:03.771 --> 00:08:04.611
data into create.

00:08:04.611 --> 00:08:05.851
We're going to be passing in some of this

00:08:05.851 --> 00:08:06.931
information into create.

00:08:07.411 --> 00:08:09.531
But this isn't type hinted for us.

00:08:09.531 --> 00:08:09.741
It's.

00:08:09.811 --> 00:08:11.971
And this isn't type hinted for us just because of

00:08:12.461 --> 00:08:13.421
the specific,

00:08:14.163 --> 00:08:17.290
the specific type inside of our workflow that we

00:08:17.290 --> 00:08:18.050
have defined.

00:08:18.130 --> 00:08:20.530
So notice that we have these params that we pass

00:08:20.530 --> 00:08:24.450
in and this makes it so our params in our payload

00:08:24.530 --> 00:08:25.490
are all typed.

00:08:25.890 --> 00:08:27.250
Now if we drill into that,

00:08:27.570 --> 00:08:30.370
I've defined this inside of a

00:08:30.690 --> 00:08:32.240
file called ServiceBindings

00:08:32.240 --> 00:08:32.990
d ts

00:08:33.240 --> 00:08:36.240
and what that does is it creates a EMV which

00:08:36.240 --> 00:08:39.680
extends the Cloudflare EMV which is inside of this

00:08:39.680 --> 00:08:40.800
worker configuration.

00:08:40.800 --> 00:08:42.600
So you notice we have this.

00:08:42.680 --> 00:08:45.480
So the reason why I've created the secondary

00:08:45.480 --> 00:08:46.520
service bindings

00:08:46.720 --> 00:08:50.220
type file is for this specific situation where

00:08:50.220 --> 00:08:52.820
there are input properties inside of a workflow

00:08:53.060 --> 00:08:54.820
that we are not able to

00:08:55.700 --> 00:08:55.800
get

00:08:55.880 --> 00:08:58.440
type hints inside of our code just because

00:08:59.000 --> 00:09:01.120
this workflow isn't able to pick up that specific,

00:09:01.120 --> 00:09:02.640
like the specific input types.

00:09:02.640 --> 00:09:05.120
So what I like to do is I like to basically take

00:09:05.120 --> 00:09:05.640
this guy

00:09:06.067 --> 00:09:06.534
and this,

00:09:06.534 --> 00:09:07.814
this file is auto generated.

00:09:07.814 --> 00:09:08.294
So you never,

00:09:08.294 --> 00:09:10.534
you never want to modify anything inside of here.

00:09:10.614 --> 00:09:11.334
But because

00:09:11.894 --> 00:09:14.614
this interface extends our cloudflare emv,

00:09:14.694 --> 00:09:17.454
what we can do is we can also override our

00:09:17.454 --> 00:09:19.334
destination evaluation workflow.

00:09:19.770 --> 00:09:21.250
And once we have this set up,

00:09:21.250 --> 00:09:23.290
what we're going to notice is when we head back

00:09:23.290 --> 00:09:24.810
over to our alarm

00:09:25.290 --> 00:09:27.050
that is actually creating this workflow,

00:09:27.210 --> 00:09:28.570
we can pass in this data.

00:09:28.570 --> 00:09:29.450
So we can say

00:09:29.770 --> 00:09:30.650
params

00:09:31.050 --> 00:09:34.130
and params is going to be basically giving us a

00:09:34.130 --> 00:09:37.050
type error because it knows that we are missing

00:09:37.050 --> 00:09:39.690
the following properties from our destination

00:09:40.170 --> 00:09:40.810
status

00:09:41.000 --> 00:09:42.200
evaluation param.

00:09:42.280 --> 00:09:42.425
So

00:09:42.425 --> 00:09:44.810
from here Essentially what we can do is we can

00:09:44.810 --> 00:09:46.210
pass in this information that's needed.

00:09:46.210 --> 00:09:46.930
So we need a link ID,

00:09:46.930 --> 00:09:47.720
a destination and

00:09:47.720 --> 00:09:48.370
account ID.

00:09:48.530 --> 00:09:49.650
So we can say

00:09:50.140 --> 00:09:55.140
link ID is going to be this.link click data.link

00:09:55.140 --> 00:09:55.420
ID.

00:09:55.896 --> 00:09:56.480
Oh yeah,

00:09:56.480 --> 00:09:58.640
and one additional thing that I want to do is I

00:09:58.640 --> 00:09:59.120
basically,

00:09:59.280 --> 00:10:01.200
I want to pull this out so we can say

00:10:01.520 --> 00:10:02.320
click data

00:10:03.440 --> 00:10:04.080
equals

00:10:04.550 --> 00:10:04.950
this

00:10:05.270 --> 00:10:06.230
dot click data.

00:10:06.710 --> 00:10:09.150
And because click data can be undefined,

00:10:09.150 --> 00:10:10.786
we're basically going to say if

00:10:11.642 --> 00:10:12.042
not

00:10:12.952 --> 00:10:15.432
click data for now let's just throw an error.

00:10:20.792 --> 00:10:21.192
Because

00:10:21.672 --> 00:10:23.832
this alarm should never be triggered if we have

00:10:23.832 --> 00:10:24.552
never set,

00:10:25.272 --> 00:10:28.351
if we have never set our click data inside of this

00:10:28.351 --> 00:10:28.751
method.

00:10:28.751 --> 00:10:29.112
So

00:10:29.432 --> 00:10:31.512
this is just kind of like a application

00:10:31.752 --> 00:10:33.112
implementation specific

00:10:33.212 --> 00:10:34.112
logic that we have.

00:10:34.112 --> 00:10:34.952
So we can say

00:10:35.312 --> 00:10:35.672
click

00:10:35.992 --> 00:10:36.392
data

00:10:36.952 --> 00:10:37.832
not set.

00:10:37.992 --> 00:10:38.752
Now you know,

00:10:38.752 --> 00:10:40.632
in a production system what you'd probably want to

00:10:40.632 --> 00:10:41.912
do is you'd probably want to

00:10:42.712 --> 00:10:42.772
catch

00:10:42.932 --> 00:10:44.952
this error error and then you know,

00:10:44.952 --> 00:10:47.512
send it to like whatever service you're using for

00:10:47.512 --> 00:10:48.152
like tracing.

00:10:48.152 --> 00:10:50.112
So you could send it like post hog and you could

00:10:50.112 --> 00:10:51.832
see those errors and you could build alerting

00:10:51.832 --> 00:10:53.352
because this is something that should never

00:10:53.352 --> 00:10:53.672
happen.

00:10:53.912 --> 00:10:54.712
But now

00:10:55.032 --> 00:10:57.512
what we can do is we can basically remove this

00:10:57.832 --> 00:11:00.032
so we can reference the click data that we've

00:11:00.032 --> 00:11:00.996
pulled out at this level

00:11:00.996 --> 00:11:01.265
and

00:11:01.585 --> 00:11:02.865
we can basically say

00:11:03.075 --> 00:11:03.555
link.

00:11:04.115 --> 00:11:06.835
We can say account ID is going to be clickdata

00:11:06.995 --> 00:11:07.795
account ID

00:11:08.385 --> 00:11:11.145
and then the destination URL is going to be click

00:11:11.145 --> 00:11:12.645
data.um,

00:11:12.865 --> 00:11:15.265
no destination URL right here.

00:11:15.265 --> 00:11:15.665
So

00:11:16.225 --> 00:11:18.545
from here we're able to trigger this workflow and

00:11:18.625 --> 00:11:20.225
we're able to make this so it is

00:11:20.475 --> 00:11:21.015
typed.

00:11:21.015 --> 00:11:23.375
So like if we have a property that is supposed to

00:11:23.375 --> 00:11:23.735
be in here,

00:11:23.735 --> 00:11:24.615
it's going to throw an error,

00:11:24.615 --> 00:11:25.535
which is really nice.

00:11:25.615 --> 00:11:26.015
So

00:11:26.495 --> 00:11:28.295
from here this is kind of recap what we've done

00:11:28.295 --> 00:11:31.535
before we deploy this guy is we have a,

00:11:31.615 --> 00:11:32.895
we have our durable object.

00:11:33.055 --> 00:11:34.775
We have some data that's going to be passed into

00:11:34.775 --> 00:11:35.615
our durable object.

00:11:35.615 --> 00:11:36.975
That data is defined

00:11:37.355 --> 00:11:39.505
in at the top level property of this class

00:11:39.825 --> 00:11:42.385
and then it is also backed up into storage.

00:11:42.465 --> 00:11:44.862
When the class starts up for the very first time,

00:11:44.954 --> 00:11:46.954
we pull the click data

00:11:47.164 --> 00:11:48.754
from storage and we save it.

00:11:48.994 --> 00:11:49.554
And then

00:11:49.732 --> 00:11:51.161
whenever we get a link click,

00:11:51.161 --> 00:11:53.121
we call this method and we pass in that

00:11:53.121 --> 00:11:55.201
information from a link click into

00:11:55.761 --> 00:11:56.161
this

00:11:56.541 --> 00:11:57.661
into this method.

00:11:57.981 --> 00:11:59.981
It gets saved in memory

00:12:00.321 --> 00:12:02.521
and it also gets backed up into store into

00:12:02.521 --> 00:12:03.041
storage.

00:12:03.041 --> 00:12:05.521
Then we grab an alarm and we basically say if

00:12:05.521 --> 00:12:07.281
there is no alarm scheduled into the future,

00:12:07.681 --> 00:12:09.041
let's schedule it out right now.

00:12:09.041 --> 00:12:10.481
We're doing 10 seconds in the future,

00:12:10.481 --> 00:12:11.801
we're probably going to change this to like three

00:12:11.801 --> 00:12:12.361
days or something.

00:12:12.361 --> 00:12:12.801
Just so,

00:12:12.801 --> 00:12:13.841
like every three days,

00:12:13.841 --> 00:12:14.681
if we get a link,

00:12:14.681 --> 00:12:15.441
click for a destination,

00:12:15.441 --> 00:12:16.560
we'll do an evaluation.

00:12:16.881 --> 00:12:17.721
You could even do,

00:12:17.721 --> 00:12:18.121
you know,

00:12:18.121 --> 00:12:20.441
more like tricky stuff where it's like if there is

00:12:20.441 --> 00:12:21.081
no alarm,

00:12:21.081 --> 00:12:22.881
just set an alarm 10 seconds from now.

00:12:22.881 --> 00:12:26.081
And then if we have run an evaluation for a link,

00:12:26.081 --> 00:12:26.481
click,

00:12:26.881 --> 00:12:27.361
one time.

00:12:27.441 --> 00:12:28.641
Let's not do it,

00:12:29.041 --> 00:12:31.281
let's not do it like more than once every seven

00:12:31.281 --> 00:12:31.561
days.

00:12:31.561 --> 00:12:33.641
So all that logic can live inside of this durable

00:12:33.641 --> 00:12:33.961
object.

00:12:33.961 --> 00:12:34.321
For now,

00:12:34.321 --> 00:12:35.921
just very simple scheduling.

00:12:35.921 --> 00:12:36.961
10 seconds into the future,

00:12:37.201 --> 00:12:38.481
10 seconds into the future,

00:12:38.801 --> 00:12:41.481
a durable object is going to trigger the alarm,

00:12:41.481 --> 00:12:43.201
which means this method is called.

00:12:43.361 --> 00:12:45.401
And this method is grabbing our link,

00:12:45.401 --> 00:12:45.921
click data,

00:12:45.921 --> 00:12:47.121
making sure that we have it,

00:12:47.201 --> 00:12:49.241
and then it is passing that information into our

00:12:49.241 --> 00:12:49.641
workflow.

00:12:49.641 --> 00:12:50.668
And our workflow should run.

00:12:50.669 --> 00:12:51.903
So now before we deploy,

00:12:51.983 --> 00:12:54.343
we have to make sure that this durable object is

00:12:54.343 --> 00:12:56.223
integrated into our queue system.

00:12:56.543 --> 00:12:59.583
So essentially once we get to the step it's picked

00:12:59.583 --> 00:13:00.543
up by the consumer,

00:13:00.543 --> 00:13:02.263
we're going to want to make sure the consumer has

00:13:02.263 --> 00:13:04.343
access to that durable object and creates a

00:13:04.343 --> 00:13:06.783
durable object instance and passes data into it.

00:13:06.863 --> 00:13:09.063
So what we're going to do is we can head over to

00:13:09.063 --> 00:13:11.183
our queue handler and we have this link click.

00:13:11.823 --> 00:13:12.223
now

00:13:12.863 --> 00:13:14.823
for now what I'm going to do is I'm just going to

00:13:14.823 --> 00:13:15.263
basically,

00:13:16.313 --> 00:13:17.513
put this inside of here.

00:13:17.513 --> 00:13:19.633
We probably pull it out into a method in a minute,

00:13:19.633 --> 00:13:21.873
but we can follow the same convention that we did

00:13:21.873 --> 00:13:23.673
in the last video to get our durable object.

00:13:23.673 --> 00:13:26.313
So we're basically going to get a durable object

00:13:26.313 --> 00:13:26.713
id

00:13:27.193 --> 00:13:29.993
and that durable object ID is going to be some,

00:13:30.073 --> 00:13:33.473
is going to contain the destination URL and the

00:13:33.473 --> 00:13:34.233
link id

00:13:34.553 --> 00:13:35.353
for a given,

00:13:36.353 --> 00:13:38.153
for a given event into here.

00:13:38.153 --> 00:13:38.513
So

00:13:38.937 --> 00:13:40.297
we can basically say

00:13:40.474 --> 00:13:41.734
emv dot

00:13:42.854 --> 00:13:44.374
evaluation scheduler.

00:13:44.454 --> 00:13:44.854
And

00:13:45.254 --> 00:13:47.414
I just realized that this is spelled wrong.

00:13:47.994 --> 00:13:48.794
should be an E.

00:13:48.794 --> 00:13:49.144
Okay,

00:13:49.144 --> 00:13:49.874
whatever you can,

00:13:49.874 --> 00:13:50.794
we can change this later.

00:13:50.804 --> 00:13:53.264
and then we're going to say ID from name ID from

00:13:53.264 --> 00:13:54.624
name is going to take in

00:13:55.344 --> 00:13:55.744
our

00:13:56.624 --> 00:13:56.644
event,

00:13:56.644 --> 00:13:59.914
uh.event.data.

00:14:01.267 --> 00:14:04.537
ID

00:14:05.177 --> 00:14:07.737
and then it's also going to get our destination

00:14:07.817 --> 00:14:08.497
URL.

00:14:08.497 --> 00:14:09.417
So we can say

00:14:10.217 --> 00:14:12.617
event.data.

00:14:13.097 --> 00:14:13.737
destination.

00:14:14.057 --> 00:14:16.937
So this is going to be unique based upon a link ID

00:14:17.097 --> 00:14:19.337
and a destination URL.

00:14:20.217 --> 00:14:21.577
Then now that we have that

00:14:22.287 --> 00:14:23.407
terrible object id,

00:14:23.407 --> 00:14:24.607
let's create a stub which is,

00:14:24.757 --> 00:14:27.077
is an instance of our durable object and we can

00:14:27.077 --> 00:14:28.889
basically say v.uh

00:14:28.889 --> 00:14:31.561
v.uh evaluation scheduler,

00:14:32.041 --> 00:14:32.441
get

00:14:32.761 --> 00:14:34.521
pass in our durable object ID.

00:14:35.745 --> 00:14:37.024
Now that we have the stub,

00:14:37.185 --> 00:14:37.545
let's

00:14:38.425 --> 00:14:41.945
stub.collect link click.

00:14:42.425 --> 00:14:43.505
Now collect link click.

00:14:43.505 --> 00:14:44.345
Takes an account ID,

00:14:44.345 --> 00:14:45.145
a link ID,

00:14:45.305 --> 00:14:46.425
destination URL,

00:14:46.865 --> 00:14:47.745
a country code.

00:14:47.745 --> 00:14:48.145
So

00:14:48.465 --> 00:14:50.625
we can come in and we can say,

00:14:51.625 --> 00:14:53.498
first thing is going to be data.event.data.account

00:14:53.498 --> 00:14:53.799
data.event.data.account

00:14:54.539 --> 00:14:57.869
ID.

00:14:57.918 --> 00:15:02.740
And we're going to say event data.the ID which is

00:15:02.740 --> 00:15:05.408
our link ID event data.

00:15:05.672 --> 00:15:06.860
Destination

00:15:07.740 --> 00:15:08.700
and then event

00:15:09.020 --> 00:15:10.870
data.country.

00:15:11.270 --> 00:15:13.190
and it looks like country is optional.

00:15:13.430 --> 00:15:13.830
So

00:15:13.874 --> 00:15:14.298
if it,

00:15:14.298 --> 00:15:15.258
if we don't have it,

00:15:15.258 --> 00:15:17.258
then we're basically just going to say

00:15:17.578 --> 00:15:17.978
or

00:15:21.414 --> 00:15:21.982
unknown.

00:15:22.942 --> 00:15:23.422
Cool.

00:15:23.502 --> 00:15:24.461
So now we have this,

00:15:24.461 --> 00:15:27.062
this data being passed into our durable object and

00:15:27.062 --> 00:15:29.022
our durable object is going to be triggered here.

00:15:29.182 --> 00:15:30.742
So the next thing that we're going to want to do

00:15:30.742 --> 00:15:32.342
is we're going to want to deploy and actually

00:15:32.342 --> 00:15:33.462
validate these changes.

00:15:33.462 --> 00:15:34.382
So data.

00:15:34.542 --> 00:15:36.502
So we're going to Get a URL,

00:15:36.502 --> 00:15:37.782
go to our Hono API.

00:15:37.862 --> 00:15:39.742
We're going to be redirected as the user,

00:15:39.742 --> 00:15:41.302
but in the background some data is going to be

00:15:41.302 --> 00:15:42.182
sent onto a queue.

00:15:42.182 --> 00:15:43.342
It's going to be put into a consumer,

00:15:43.342 --> 00:15:44.782
it's going to be saved into a database.

00:15:44.782 --> 00:15:47.422
Database is going to call a durable object.

00:15:47.422 --> 00:15:49.822
Durable object is going to manage an alarm that

00:15:49.822 --> 00:15:50.982
triggers our workflow.

00:15:51.062 --> 00:15:51.306
So

00:15:51.642 --> 00:15:52.122
hopefully,

00:15:52.122 --> 00:15:53.362
I mean this has kind of been a lot of code.

00:15:53.362 --> 00:15:54.442
Hopefully everything works.

00:15:54.602 --> 00:15:55.802
I suspect it will,

00:15:55.872 --> 00:15:57.102
let's say PNPM run

00:15:57.502 --> 00:15:58.669
deployment.

00:15:58.807 --> 00:15:59.167
Okay,

00:15:59.167 --> 00:16:01.367
we have successfully deployed this application.

00:16:01.367 --> 00:16:03.927
I'm going to head over to Cloudflare and I'm going

00:16:03.927 --> 00:16:06.167
to open our data service into

00:16:06.887 --> 00:16:08.007
its own tab.

00:16:08.967 --> 00:16:11.127
And then I'm also going to head over to workflows.

00:16:11.607 --> 00:16:12.007
Now

00:16:12.407 --> 00:16:14.647
I'm going to turn on real time log so we can see

00:16:14.647 --> 00:16:15.745
exactly what's happening here.

00:16:15.845 --> 00:16:18.645
And inside of our Smart Links user application,

00:16:18.805 --> 00:16:21.925
I just kind of went to one of the links that have

00:16:21.925 --> 00:16:23.685
like a legit URL associated with it.

00:16:23.685 --> 00:16:26.605
So this one specifically is going to redirect us

00:16:26.605 --> 00:16:27.717
to Google.

00:16:28.207 --> 00:16:30.607
so I'm going to basically come into here and I'm

00:16:30.607 --> 00:16:31.247
going to say

00:16:32.027 --> 00:16:32.827
data service.

00:16:32.987 --> 00:16:34.587
This should redirect us to Google.

00:16:35.227 --> 00:16:37.787
Now in here you can see that we got this link id.

00:16:38.337 --> 00:16:39.807
our queue should pick up really soon.

00:16:39.807 --> 00:16:41.287
Our queue just picked up really soon.

00:16:41.367 --> 00:16:44.007
10 seconds from now we should see a log that

00:16:44.567 --> 00:16:46.247
says our alarm is being triggered.

00:16:46.727 --> 00:16:49.447
And I'm going to come over to here and we should

00:16:49.447 --> 00:16:51.007
see this in just a few seconds.

00:16:51.007 --> 00:16:51.847
Another instance.

00:16:51.847 --> 00:16:53.447
So you can see one just queued up,

00:16:53.677 --> 00:16:54.237
which means

00:16:54.717 --> 00:16:55.917
it went through our

00:16:55.917 --> 00:16:57.327
it went through the entire flow.

00:16:57.487 --> 00:16:58.447
One just queued

00:16:59.117 --> 00:17:00.357
and the queue just finished.

00:17:00.357 --> 00:17:01.093
And you can see

00:17:01.233 --> 00:17:03.233
the last instances that we ran were actually

00:17:03.233 --> 00:17:05.713
yesterday and this one just barely triggered for

00:17:05.713 --> 00:17:06.033
today.

00:17:06.273 --> 00:17:08.633
So we come into here and we can see,

00:17:08.633 --> 00:17:09.153
oh look,

00:17:09.153 --> 00:17:09.793
the entire

00:17:10.453 --> 00:17:11.253
our entire

00:17:11.813 --> 00:17:13.253
workflow ran successfully.

00:17:13.333 --> 00:17:14.683
We rendered the page,

00:17:15.303 --> 00:17:17.523
we used AI to evaluate the page,

00:17:17.843 --> 00:17:18.243
we

00:17:18.643 --> 00:17:19.183
got the

00:17:19.323 --> 00:17:21.323
we saved the evaluation to the database and then

00:17:21.323 --> 00:17:22.923
we back some stuff up into R2.

00:17:23.163 --> 00:17:24.763
Now if we head over to R2

00:17:25.347 --> 00:17:26.707
we should be able to

00:17:27.027 --> 00:17:29.907
grab this ID that was saved into the database,

00:17:30.227 --> 00:17:32.947
head over to R2 and I want to see if we get that

00:17:33.247 --> 00:17:34.407
image that we've created.

00:17:34.407 --> 00:17:34.767
So

00:17:35.647 --> 00:17:37.247
so we can go to our evaluations,

00:17:37.247 --> 00:17:38.527
go to our specific

00:17:38.659 --> 00:17:38.919
account.

00:17:39.719 --> 00:17:41.319
So this is going to be this one.

00:17:41.639 --> 00:17:42.943
So this is the HTML.

00:17:42.943 --> 00:17:45.376
This is going to basically be HTML for Google.

00:17:45.376 --> 00:17:45.776
But

00:17:45.838 --> 00:17:48.487
because I added a screenshot logic,

00:17:48.487 --> 00:17:50.072
you should see that Google renders here.

00:17:50.072 --> 00:17:50.472
So yeah,

00:17:50.472 --> 00:17:51.592
we're able to pick up,

00:17:51.752 --> 00:17:54.392
render Google and it's able to actually like,

00:17:54.682 --> 00:17:54.962
you know,

00:17:54.962 --> 00:17:56.322
get that screenshot of what was rendered.

00:17:56.322 --> 00:17:57.082
So it's pretty cool.

00:17:57.082 --> 00:17:59.762
So we have essentially this entire pipeline built

00:17:59.762 --> 00:17:59.962
out.

00:17:59.962 --> 00:18:00.512
We have

00:18:00.512 --> 00:18:00.755
you know,

00:18:00.755 --> 00:18:01.555
just to recap,

00:18:01.555 --> 00:18:03.795
we have this logic that went to hono,

00:18:03.795 --> 00:18:06.635
redirected based upon the destination of a given

00:18:06.635 --> 00:18:07.315
link id,

00:18:07.395 --> 00:18:08.555
sent some data to a queue,

00:18:08.555 --> 00:18:09.715
a consumer picked it up,

00:18:09.795 --> 00:18:11.395
saved some data into a database,

00:18:11.475 --> 00:18:12.595
went into an alarm.

00:18:13.515 --> 00:18:16.395
we went to alarm and then the or to a durable

00:18:16.395 --> 00:18:16.675
object.

00:18:16.675 --> 00:18:18.715
Durable object said 10 seconds from now we're

00:18:18.715 --> 00:18:19.515
going to run a workflow.

00:18:19.515 --> 00:18:21.475
The workflow triggered and all of these steps went

00:18:21.475 --> 00:18:21.675
through.

00:18:21.675 --> 00:18:22.795
So at this point we have

00:18:23.195 --> 00:18:23.355
really,

00:18:23.355 --> 00:18:24.205
really advanced

00:18:24.555 --> 00:18:25.595
data pipeline.

00:18:25.755 --> 00:18:27.475
And you know you could just see like this is

00:18:27.475 --> 00:18:29.075
actually really simple but you could,

00:18:29.075 --> 00:18:29.995
this is so modular.

00:18:29.995 --> 00:18:31.555
You could extend this so you could come in,

00:18:31.555 --> 00:18:32.435
you could basically say like,

00:18:32.435 --> 00:18:32.675
okay,

00:18:32.675 --> 00:18:32.875
yeah,

00:18:32.875 --> 00:18:33.595
I've been running

00:18:33.955 --> 00:18:35.555
these workflows people for people,

00:18:35.555 --> 00:18:36.115
for free.

00:18:36.115 --> 00:18:38.035
I'm going to make this a paid product.

00:18:38.195 --> 00:18:40.355
So you could come into your durable object and you

00:18:40.355 --> 00:18:42.435
could add some additional logic to basically say

00:18:42.435 --> 00:18:43.715
like when the alarm triggers,

00:18:43.715 --> 00:18:45.235
let's go check the user's account,

00:18:45.235 --> 00:18:46.075
let's see if that,

00:18:46.075 --> 00:18:47.035
let's see if they're paid.

00:18:47.035 --> 00:18:48.505
And if they're not paid then you,

00:18:48.575 --> 00:18:48.775
you know,

00:18:48.775 --> 00:18:50.775
let's not run it and let's maybe send them an

00:18:50.775 --> 00:18:51.495
email and say like,

00:18:51.495 --> 00:18:51.775
hey,

00:18:51.775 --> 00:18:53.295
like you have ten,

00:18:53.575 --> 00:18:53.715
you,

00:18:53.715 --> 00:18:55.355
you've received like a hundred link clicks this

00:18:55.355 --> 00:18:55.635
month.

00:18:56.475 --> 00:18:57.035
you know,

00:18:57.035 --> 00:18:59.275
we have determined that a few of these links might

00:18:59.275 --> 00:18:59.755
not be

00:19:00.155 --> 00:19:01.275
working as expected.

00:19:01.435 --> 00:19:02.875
Would you like to enable,

00:19:03.504 --> 00:19:04.705
would you like to enable the,

00:19:04.705 --> 00:19:05.025
our

00:19:05.425 --> 00:19:05.985
AI,

00:19:06.225 --> 00:19:06.665
you know,

00:19:06.665 --> 00:19:08.945
our smart AI system to evaluate the,

00:19:08.945 --> 00:19:10.385
the web pages and whatnot.

00:19:10.385 --> 00:19:10.785
So like,

00:19:10.785 --> 00:19:12.385
there's a lot of stuff that you could do in here.

00:19:12.495 --> 00:19:13.775
it's really up to you to decide.

00:19:13.775 --> 00:19:15.655
But I do like designing this way because the

00:19:15.655 --> 00:19:16.975
entire system is really modular.

00:19:17.135 --> 00:19:18.735
If I want to manage scheduling,

00:19:18.735 --> 00:19:21.095
I can just like manage this durable object if I

00:19:21.095 --> 00:19:23.015
want to manage the features inside of a workflow.

00:19:23.015 --> 00:19:25.415
Because as you noticed like before we had a

00:19:25.415 --> 00:19:27.935
pipeline that would just get the HTML and would

00:19:27.935 --> 00:19:28.415
get the

00:19:29.345 --> 00:19:29.705
the,

00:19:29.705 --> 00:19:30.625
the body text,

00:19:30.945 --> 00:19:31.465
analyze,

00:19:31.465 --> 00:19:32.105
save in database,

00:19:32.105 --> 00:19:32.665
go to R2.

00:19:32.665 --> 00:19:33.305
But then I was like,

00:19:33.305 --> 00:19:33.505
oh,

00:19:33.505 --> 00:19:33.625
well,

00:19:33.625 --> 00:19:34.865
I want to debug what's happening.

00:19:34.945 --> 00:19:37.665
So I just enhanced the browser rendering aspect of

00:19:37.665 --> 00:19:40.365
it to also take a screenshot and then also save

00:19:40.365 --> 00:19:41.125
that into R2.

00:19:41.125 --> 00:19:42.685
So this entire system is very,

00:19:42.685 --> 00:19:43.845
very modular and it's really,

00:19:43.845 --> 00:19:44.885
really easy to maintain.

00:19:45.075 --> 00:19:47.035
so from here there's like a lot of directions that

00:19:47.035 --> 00:19:47.487
we can go.

00:19:47.487 --> 00:19:49.607
Now I do want to call out one thing just in case

00:19:49.607 --> 00:19:50.647
it wasn't super clear.

00:19:50.807 --> 00:19:51.207
Now

00:19:51.687 --> 00:19:54.007
we've set this alarm for 10 seconds.

00:19:54.167 --> 00:19:56.487
I want to probably say like,

00:19:56.487 --> 00:19:57.047
let's do

00:19:57.367 --> 00:19:58.327
24 hours

00:19:58.631 --> 00:19:59.705
or we'll just say one

00:20:00.025 --> 00:20:02.345
day and we're going to say 24

00:20:03.207 --> 00:20:03.447
hours

00:20:03.770 --> 00:20:04.789
and we're going to pass this in.

00:20:05.029 --> 00:20:06.949
Now the reason why we're doing it this way,

00:20:06.949 --> 00:20:07.989
in case it wasn't clear,

00:20:07.989 --> 00:20:10.349
is essentially what happens is when we get this

00:20:10.349 --> 00:20:11.909
link click and we go to Google,

00:20:12.229 --> 00:20:14.909
we could get that same link click from people all

00:20:14.909 --> 00:20:16.629
around the world going to the same destination.

00:20:16.709 --> 00:20:18.389
We could get 10,000 of them,

00:20:18.389 --> 00:20:19.829
we could get 20,000 of them,

00:20:19.989 --> 00:20:23.749
but we're only going to be running the workflow

00:20:23.829 --> 00:20:24.549
one time,

00:20:24.899 --> 00:20:26.129
in this 24 hour period.

00:20:26.289 --> 00:20:28.769
So this would make your system scale and it's

00:20:28.769 --> 00:20:30.089
really easy to basically say like,

00:20:30.089 --> 00:20:30.449
you know,

00:20:30.449 --> 00:20:32.988
I only want to run workflows for one destination

00:20:33.548 --> 00:20:34.268
URL,

00:20:34.398 --> 00:20:35.118
in a given

00:20:35.438 --> 00:20:37.038
window in a given period of time.

00:20:37.278 --> 00:20:38.878
Even if a link click gets

00:20:39.198 --> 00:20:41.718
500,000 clicks or 1 million clicks or you know,

00:20:41.718 --> 00:20:42.958
100 million clicks,

00:20:43.118 --> 00:20:44.558
you're not going to have to like,

00:20:44.718 --> 00:20:45.278
you know,

00:20:45.278 --> 00:20:47.678
have a workflow that is running so many times.

00:20:47.678 --> 00:20:49.758
So you're able to really control your spend and

00:20:49.758 --> 00:20:51.438
your logic here at this level,

00:20:51.438 --> 00:20:52.078
which is really,

00:20:52.078 --> 00:20:52.318
really,

00:20:52.318 --> 00:20:52.958
really nice.

00:20:53.079 --> 00:20:54.872
So now before we conclude this video,

00:20:54.952 --> 00:20:57.112
I want to take this logic

00:20:57.603 --> 00:20:58.963
and let's move this into

00:20:59.443 --> 00:21:00.883
its own function.

00:21:00.883 --> 00:21:03.283
So we have our helper functions and let's see what

00:21:03.283 --> 00:21:04.003
we have in there.

00:21:04.083 --> 00:21:07.203
So inside of our helper functions we have our

00:21:07.743 --> 00:21:08.443
route ops.

00:21:08.443 --> 00:21:09.963
I think that's kind of where we're going to want

00:21:09.963 --> 00:21:10.443
to put it.

00:21:10.443 --> 00:21:13.763
So right now link click is in Route Ops.

00:21:13.763 --> 00:21:15.523
I'm also going to create another

00:21:17.013 --> 00:21:19.013
class or another function into here.

00:21:19.013 --> 00:21:20.213
Let's just copy this guy.

00:21:20.373 --> 00:21:21.813
Let's go to Route Ops

00:21:22.213 --> 00:21:23.733
and let's say

00:21:24.213 --> 00:21:24.933
export,

00:21:26.858 --> 00:21:27.498
schedule,

00:21:28.361 --> 00:21:28.911
eval

00:21:29.871 --> 00:21:30.831
workflow.

00:21:31.071 --> 00:21:32.764
That's going to take an EMV

00:21:33.363 --> 00:21:35.083
and it's also going to be take,

00:21:35.083 --> 00:21:36.483
it's going to take link

00:21:36.963 --> 00:21:37.603
info.

00:21:44.693 --> 00:21:44.853
Oh,

00:21:44.853 --> 00:21:45.253
I forgot.

00:21:45.253 --> 00:21:46.613
This has to be an async

00:21:47.413 --> 00:21:48.053
function.

00:21:48.555 --> 00:21:50.430
Make sure that this is of the type emv.

00:21:50.830 --> 00:21:52.990
Then we can paste this stuff into here.

00:21:53.450 --> 00:21:53.850
and

00:21:54.410 --> 00:21:56.890
I think we can just call this event to make it

00:21:59.109 --> 00:21:59.332
cool.

00:21:59.340 --> 00:21:59.540
Yeah,

00:21:59.540 --> 00:22:01.860
I'm actually just going to call this link info and

00:22:01.860 --> 00:22:03.500
then we can say link info ID

00:22:04.460 --> 00:22:04.860
here.

00:22:09.907 --> 00:22:11.909
It actually looks like I'm referencing the wrong

00:22:11.909 --> 00:22:12.389
type here.

00:22:12.389 --> 00:22:15.029
This should actually be a link click message type.

00:22:15.029 --> 00:22:15.429
So

00:22:16.089 --> 00:22:17.849
let's just make sure we import that guy.

00:22:17.849 --> 00:22:20.249
And I'm just going to call this.

00:22:21.869 --> 00:22:22.429
just go back.

00:22:22.829 --> 00:22:24.189
I'm just going to undo these guys.

00:22:24.189 --> 00:22:25.709
We're going to keep this as event

00:22:26.189 --> 00:22:27.629
and I'm just going to say event

00:22:29.292 --> 00:22:30.651
and it's going to be

00:22:31.212 --> 00:22:31.612
the

00:22:32.332 --> 00:22:33.772
link click message type,

00:22:33.772 --> 00:22:35.012
make sure that is imported.

00:22:35.012 --> 00:22:36.412
Now this all should function.

00:22:36.412 --> 00:22:36.812
So,

00:22:37.272 --> 00:22:39.752
head back over to our link clicks,

00:22:40.232 --> 00:22:41.112
delete this stuff.

00:22:41.112 --> 00:22:43.032
And then we're just going to say await

00:22:44.152 --> 00:22:47.192
and we will pass in EMV and event

00:22:48.837 --> 00:22:50.217
and make sure it is imported.

00:22:50.217 --> 00:22:50.565
Cool.

00:22:50.725 --> 00:22:51.165
All right,

00:22:51.165 --> 00:22:53.445
so now we have a function that saves data into a

00:22:53.445 --> 00:22:53.925
database

00:22:54.325 --> 00:22:57.845
and then we have a method that basically schedules

00:22:57.845 --> 00:22:59.925
out our workflow for a given link click.

00:23:00.005 --> 00:23:01.565
So this is our queue handler,

00:23:01.565 --> 00:23:02.165
by the way,

00:23:02.165 --> 00:23:05.045
which is being utilized right inside of our

00:23:05.565 --> 00:23:06.013
consumer.

00:23:06.049 --> 00:23:06.449
Okay,

00:23:06.449 --> 00:23:08.289
so in this next video we're going to dive,

00:23:08.289 --> 00:23:09.936
we're going to be diving deeper into durable

00:23:09.936 --> 00:23:10.376
objects.

00:23:10.376 --> 00:23:11.936
We're actually going to start implementing some

00:23:11.936 --> 00:23:14.296
websockets and stuff for another feature now that

00:23:14.296 --> 00:23:15.616
we have a understanding of,

00:23:15.616 --> 00:23:16.096
you know,

00:23:16.096 --> 00:23:19.175
like the base class of a durable object and just,

00:23:19.175 --> 00:23:19.496
you know,

00:23:19.496 --> 00:23:21.536
like the very basics of how to

00:23:22.256 --> 00:23:22.296
utilize,

00:23:22.716 --> 00:23:23.676
it with storage,

00:23:23.676 --> 00:23:24.996
alarms and whatnot.

