WEBVTT
X-TIMESTAMP-MAP=LOCAL:00:00:00.000,MPEGTS:900000

00:00:00.060 --> 00:00:00.460
All right,

00:00:00.460 --> 00:00:01.660
so in this next section of the course,

00:00:01.660 --> 00:00:03.260
we're going to be building out our evaluation

00:00:03.260 --> 00:00:03.900
engine,

00:00:03.900 --> 00:00:07.380
which ultimately is a multi step workflow that is

00:00:07.380 --> 00:00:09.980
designed to check these destination URLs to make

00:00:09.980 --> 00:00:11.860
sure the content behind those URLs is still

00:00:11.860 --> 00:00:13.060
available or still healthy.

00:00:13.060 --> 00:00:14.260
So if it's an E commerce page,

00:00:14.260 --> 00:00:16.500
you can imagine a user would want to know if the

00:00:16.500 --> 00:00:17.850
product is all of a sudden sold out.

00:00:18.450 --> 00:00:19.770
and we're going to use AI to do this.

00:00:19.770 --> 00:00:20.130
So like,

00:00:20.130 --> 00:00:21.850
there's a lot of directions this tool could go.

00:00:21.850 --> 00:00:23.850
We're going to keep it pretty simple for this

00:00:23.850 --> 00:00:24.170
course.

00:00:24.170 --> 00:00:24.530
But

00:00:24.930 --> 00:00:25.330
throughout,

00:00:25.380 --> 00:00:26.540
throughout the development of this,

00:00:26.540 --> 00:00:27.340
you can kind of think like,

00:00:27.340 --> 00:00:27.540
oh,

00:00:27.540 --> 00:00:29.100
how could I extend this to make it more powerful

00:00:29.100 --> 00:00:30.020
and more feature rich.

00:00:30.020 --> 00:00:30.340
But

00:00:30.590 --> 00:00:31.880
what we're going to do is we're going to leverage

00:00:31.880 --> 00:00:34.640
Cloudflare workflows to essentially build a multi

00:00:34.640 --> 00:00:38.640
step workflow where we 1 load the destination URL,

00:00:38.720 --> 00:00:41.200
make sure all the content loads fully renders,

00:00:41.200 --> 00:00:42.680
because sometimes important information is

00:00:42.680 --> 00:00:45.280
populated by JavaScript after like the pages

00:00:45.360 --> 00:00:46.640
retrieved from a server.

00:00:47.220 --> 00:00:48.500
once it's fully loaded,

00:00:48.580 --> 00:00:49.540
grab all that content,

00:00:50.110 --> 00:00:50.830
save all the text,

00:00:50.830 --> 00:00:52.670
save all the HTML and then

00:00:52.670 --> 00:00:55.750
pass that over to an AI model as the next step to

00:00:56.150 --> 00:00:58.610
ultimately determine like our logic to determine

00:00:58.610 --> 00:00:59.930
if a link is healthy or not.

00:00:59.930 --> 00:01:01.490
And then the last step is going to be stuffing

00:01:01.490 --> 00:01:03.850
that data back into R2 just so we can store it

00:01:03.850 --> 00:01:04.570
temporarily,

00:01:04.590 --> 00:01:05.239
so we can

00:01:05.560 --> 00:01:06.480
build out like,

00:01:06.480 --> 00:01:06.920
you know,

00:01:06.920 --> 00:01:08.040
this isn't something we're going to do in the

00:01:08.040 --> 00:01:08.200
course,

00:01:08.200 --> 00:01:09.840
but you can imagine you could build out different

00:01:09.840 --> 00:01:10.280
types of

00:01:10.350 --> 00:01:12.630
workflows to evaluate the,

00:01:12.630 --> 00:01:15.150
to manually evaluate or to use AI to evaluate

00:01:15.170 --> 00:01:16.530
the accuracy of your

00:01:16.980 --> 00:01:17.900
evaluation engine.

00:01:17.900 --> 00:01:18.260
So,

00:01:18.600 --> 00:01:19.960
this is a pretty cool section.

00:01:20.100 --> 00:01:22.160
we're going to be using Cloudflare workflows.

00:01:22.160 --> 00:01:23.040
We're going to use the Open,

00:01:23.200 --> 00:01:24.800
or we're going to use the AI SDK,

00:01:24.907 --> 00:01:27.124
and then browser rendering by Puppeteer.

00:01:27.124 --> 00:01:27.484
So

00:01:28.194 --> 00:01:30.394
before we dive too deep into the actual code

00:01:30.394 --> 00:01:30.994
implementation,

00:01:30.994 --> 00:01:32.714
let's just kind of like take a look at what

00:01:32.714 --> 00:01:33.754
Cloudflare workers are.

00:01:33.754 --> 00:01:35.634
So their documentation on Cloudflare workers are

00:01:35.634 --> 00:01:35.914
pretty good.

00:01:35.914 --> 00:01:37.074
It's a relatively new product.

00:01:37.154 --> 00:01:38.914
It just recently became generally available.

00:01:39.154 --> 00:01:39.434
I

00:01:39.894 --> 00:01:41.854
use this product way more than I originally

00:01:41.854 --> 00:01:42.454
thought that I would.

00:01:42.454 --> 00:01:43.374
I always thought that like,

00:01:43.374 --> 00:01:43.574
oh,

00:01:43.574 --> 00:01:45.054
I could do the same thing theoretically with

00:01:45.054 --> 00:01:45.814
durable objects,

00:01:45.814 --> 00:01:47.734
which you can because this is built on top of

00:01:47.734 --> 00:01:48.654
durable objects.

00:01:48.654 --> 00:01:49.014
But

00:01:50.214 --> 00:01:51.214
it's running,

00:01:51.214 --> 00:01:53.414
it's technically running on Cloudflare's account,

00:01:53.414 --> 00:01:55.254
not like your Personal Cloudflare account.

00:01:55.254 --> 00:01:56.454
So there are like,

00:01:56.454 --> 00:01:58.014
because of that they're able to like release this

00:01:58.014 --> 00:01:59.934
on the free tier so you can use it even if like

00:01:59.934 --> 00:02:01.174
you're not paying for Cloudflare.

00:02:01.414 --> 00:02:03.294
And there's some different like limits and pricing

00:02:03.294 --> 00:02:04.054
related to that,

00:02:04.054 --> 00:02:05.494
but it's a really cool product.

00:02:05.534 --> 00:02:07.154
ultimately like if we just read through here,

00:02:07.154 --> 00:02:07.474
it

00:02:08.044 --> 00:02:09.444
workflows allow you to build multi step

00:02:09.444 --> 00:02:11.404
applications that can automatically retry,

00:02:11.404 --> 00:02:11.964
persist,

00:02:11.964 --> 00:02:13.404
state and run for minutes,

00:02:13.404 --> 00:02:13.724
hours,

00:02:13.724 --> 00:02:14.764
days or weeks.

00:02:16.084 --> 00:02:16.332
so

00:02:16.332 --> 00:02:19.304
there's so many workflows that I find myself in,

00:02:19.544 --> 00:02:21.224
that I find myself building out and using

00:02:21.544 --> 00:02:22.944
in this new world of AI.

00:02:22.944 --> 00:02:25.224
Because so much is just like it used to be.

00:02:25.304 --> 00:02:27.424
Most operations you just kind of do behind an API,

00:02:27.424 --> 00:02:28.184
they're pretty quick.

00:02:28.314 --> 00:02:30.954
and then like the heavier long running tasks that

00:02:30.954 --> 00:02:32.234
I would do at an enterprise level,

00:02:32.234 --> 00:02:34.074
you'd use like really beefy hardware.

00:02:34.074 --> 00:02:35.754
You'd use airflow to orchestrate,

00:02:36.104 --> 00:02:36.784
spark jobs.

00:02:36.784 --> 00:02:38.664
You'd move tons and tons of data around.

00:02:38.664 --> 00:02:40.944
But with this AI inference world you're kind of

00:02:40.944 --> 00:02:41.944
like you know,

00:02:41.944 --> 00:02:43.064
sending off a request,

00:02:43.144 --> 00:02:44.904
waiting 30 seconds for something to happen,

00:02:44.904 --> 00:02:45.504
getting that,

00:02:45.504 --> 00:02:47.984
making sure that you're reliably able to get the

00:02:47.984 --> 00:02:48.264
result,

00:02:48.344 --> 00:02:48.824
save it,

00:02:48.824 --> 00:02:49.544
store it how,

00:02:49.544 --> 00:02:50.774
how you want to store it.

00:02:51.354 --> 00:02:53.474
and because of this like the whole API model

00:02:53.474 --> 00:02:53.954
doesn't work.

00:02:53.954 --> 00:02:56.434
But it's also not like a heavy task that you want

00:02:56.434 --> 00:02:59.314
to like kind of offload to these more like really

00:02:59.314 --> 00:03:01.154
beefy data orchestration software.

00:03:01.154 --> 00:03:01.514
So

00:03:01.874 --> 00:03:04.074
Cloudflare Workflows is a great tool for that.

00:03:04.074 --> 00:03:06.634
And if you look at like just like the basic setup

00:03:06.634 --> 00:03:06.994
of it,

00:03:07.554 --> 00:03:09.074
essentially all that you have to do

00:03:09.474 --> 00:03:11.554
is you use the workflow entry point,

00:03:11.634 --> 00:03:13.594
you extend it with whatever your class name is,

00:03:13.594 --> 00:03:15.874
and then you define a run method that takes an

00:03:15.874 --> 00:03:18.074
event and like you can pass data into this event,

00:03:18.074 --> 00:03:19.874
so you can pass some parameters into this event

00:03:20.434 --> 00:03:23.394
and then you define some steps and inside of this

00:03:23.394 --> 00:03:24.994
run method is where your workflow lives.

00:03:24.994 --> 00:03:26.754
So like you can say like this is your first step

00:03:26.754 --> 00:03:28.194
and it's doing something with files.

00:03:28.194 --> 00:03:29.714
This isn't honestly the best example,

00:03:29.714 --> 00:03:30.034
but

00:03:30.434 --> 00:03:32.544
and then the next step is like an API response,

00:03:32.764 --> 00:03:35.484
like goes to an API and then the next one is like,

00:03:35.484 --> 00:03:35.684
oh,

00:03:35.684 --> 00:03:36.924
let's sleep for a period of time.

00:03:36.924 --> 00:03:38.124
It's pretty cool that you can sleep.

00:03:38.124 --> 00:03:39.144
there's other things that you could do.

00:03:39.144 --> 00:03:41.104
You could like say pause and wait for an event

00:03:41.424 --> 00:03:43.784
and your workflow could literally just pause for

00:03:43.784 --> 00:03:45.304
like a whole year if you needed to.

00:03:45.304 --> 00:03:46.864
And then you can have some other service doing

00:03:46.864 --> 00:03:48.704
something and then when something is completed,

00:03:48.864 --> 00:03:50.464
it could tell your workflow,

00:03:50.464 --> 00:03:50.744
hey,

00:03:50.744 --> 00:03:51.184
here's an,

00:03:51.184 --> 00:03:51.784
here's an event.

00:03:51.784 --> 00:03:53.024
I just finished this.

00:03:53.104 --> 00:03:54.464
And then when you get that event,

00:03:54.464 --> 00:03:55.544
you could like resume.

00:03:55.544 --> 00:03:56.944
So that's another cool feature that they have.

00:03:57.264 --> 00:03:57.584
but really,

00:03:57.584 --> 00:03:59.734
it's just the thing that I like about it the most

00:03:59.734 --> 00:04:03.094
is I can take like these isolated steps of logic

00:04:03.094 --> 00:04:03.894
and I can

00:04:03.914 --> 00:04:06.015
define whatever code that I have inside of here.

00:04:06.255 --> 00:04:08.775
And then what you can do is you can define like

00:04:08.775 --> 00:04:10.335
inside of a config that's optional.

00:04:10.335 --> 00:04:11.895
There's some defaults if you don't specify

00:04:11.895 --> 00:04:14.175
anything where you can say how many times you want

00:04:14.175 --> 00:04:14.895
it to retry.

00:04:15.155 --> 00:04:16.545
the delay of each retry,

00:04:16.545 --> 00:04:18.145
like the back off strategy,

00:04:18.145 --> 00:04:18.945
so exponential.

00:04:18.945 --> 00:04:21.065
So like increasingly becomes longer and longer

00:04:21.065 --> 00:04:22.065
each time it retries.

00:04:22.065 --> 00:04:23.825
And it's really cool that you can do that at a

00:04:23.825 --> 00:04:25.345
step level because you could

00:04:25.975 --> 00:04:27.815
render a browser which is relatively cheap.

00:04:27.965 --> 00:04:28.555
and you could say,

00:04:28.555 --> 00:04:28.835
okay,

00:04:28.835 --> 00:04:29.395
if it fails,

00:04:29.395 --> 00:04:30.555
I want to do this like three times.

00:04:30.725 --> 00:04:33.355
and then when you do the AI computation for the

00:04:33.355 --> 00:04:33.835
next step,

00:04:33.835 --> 00:04:34.275
you know,

00:04:34.275 --> 00:04:34.915
you could say like,

00:04:34.915 --> 00:04:35.235
I don't.

00:04:35.235 --> 00:04:36.395
If like there's an issue with

00:04:36.765 --> 00:04:37.435
my logic,

00:04:37.435 --> 00:04:39.835
or if there's an issue with like some provider,

00:04:40.475 --> 00:04:42.155
probably mostly just your logic,

00:04:42.315 --> 00:04:43.155
you could say like,

00:04:43.155 --> 00:04:43.715
if it fails,

00:04:43.715 --> 00:04:44.355
it fails once.

00:04:44.355 --> 00:04:46.195
I'm not going to try it five different times and

00:04:46.195 --> 00:04:46.596
then like

00:04:46.596 --> 00:04:49.255
multiply my AI spin by five times and then not

00:04:49.255 --> 00:04:51.055
have my code in like a functioning state.

00:04:51.055 --> 00:04:51.455
So

00:04:51.885 --> 00:04:53.685
it is really cool that you can segment this logic

00:04:53.685 --> 00:04:55.005
in this really concise way.

00:04:55.565 --> 00:04:56.125
and then

00:04:56.289 --> 00:04:57.249
one thing that

00:04:58.389 --> 00:04:59.269
is important to know,

00:04:59.269 --> 00:05:00.589
they do have some different limits here.

00:05:00.589 --> 00:05:00.949
So

00:05:01.749 --> 00:05:03.789
depending on your workload this might be an issue.

00:05:03.789 --> 00:05:04.549
I think for

00:05:04.869 --> 00:05:06.229
95% of

00:05:06.549 --> 00:05:07.229
people's work,

00:05:07.229 --> 00:05:08.229
like use cases,

00:05:08.229 --> 00:05:09.149
this isn't an issue.

00:05:09.149 --> 00:05:11.909
But they do have a concurrent workflow instance

00:05:11.909 --> 00:05:12.429
execution,

00:05:12.429 --> 00:05:15.669
which essentially means the number of instances of

00:05:15.669 --> 00:05:17.349
your workflow that are currently running at a

00:05:17.349 --> 00:05:18.149
given point in time.

00:05:18.439 --> 00:05:19.479
If you're on a paid tier,

00:05:19.479 --> 00:05:20.959
can be 4,500,

00:05:20.959 --> 00:05:21.639
which is really,

00:05:21.639 --> 00:05:23.679
really high for a concurrent use case.

00:05:23.679 --> 00:05:24.039
And

00:05:24.849 --> 00:05:26.809
if you do need more than that,

00:05:26.809 --> 00:05:28.169
they do have this like,

00:05:28.169 --> 00:05:30.049
form that you can fill out to request for higher

00:05:30.049 --> 00:05:30.409
limits.

00:05:30.409 --> 00:05:31.409
I don't really know like

00:05:31.729 --> 00:05:32.129
how

00:05:32.609 --> 00:05:33.409
often they

00:05:33.838 --> 00:05:36.199
will give you those like limit increases.

00:05:36.199 --> 00:05:37.679
I assume they would,

00:05:37.679 --> 00:05:38.119
you know,

00:05:38.119 --> 00:05:38.559
like they.

00:05:38.639 --> 00:05:40.789
Cloudflare seems to work with you.

00:05:41.329 --> 00:05:42.129
but yeah,

00:05:42.129 --> 00:05:43.169
I would just keep this in mind.

00:05:43.169 --> 00:05:45.529
Like if you have some random use case which you

00:05:45.529 --> 00:05:45.769
know,

00:05:45.769 --> 00:05:48.239
where you have like 10,000 concurrent runs going

00:05:48.239 --> 00:05:48.839
on at a,

00:05:48.919 --> 00:05:49.959
at a given point in time,

00:05:49.959 --> 00:05:52.399
this might not be the best option just because of

00:05:52.399 --> 00:05:53.479
this limitation right here,

00:05:53.639 --> 00:05:55.999
but you could theoretically build out this exact

00:05:55.999 --> 00:05:57.479
same thing on top of durable objects.

00:05:57.479 --> 00:05:59.199
And we'll be getting into durable objects later in

00:05:59.199 --> 00:05:59.639
this course,

00:05:59.799 --> 00:06:01.399
so definitely keep that in mind.

00:06:01.429 --> 00:06:02.588
if you're going to sleep,

00:06:02.588 --> 00:06:04.709
kind of like delay something for running,

00:06:05.109 --> 00:06:06.709
you have a maximum of a year,

00:06:06.709 --> 00:06:07.789
which is kind of crazy.

00:06:07.789 --> 00:06:09.869
You could just like tell your code to sleep and

00:06:09.869 --> 00:06:10.789
then six months from now,

00:06:10.789 --> 00:06:11.549
wake up and do something,

00:06:11.549 --> 00:06:11.949
you know,

00:06:11.949 --> 00:06:12.189
which,

00:06:12.189 --> 00:06:12.869
which is cool.

00:06:12.869 --> 00:06:15.069
these are like the core limitations that I do

00:06:15.069 --> 00:06:16.309
think that you should call out.

00:06:16.769 --> 00:06:17.009
and

00:06:17.365 --> 00:06:18.925
one other thing that I wanted to call out.

00:06:18.925 --> 00:06:19.445
This is a very,

00:06:19.445 --> 00:06:21.325
very similar product to something else called

00:06:21.325 --> 00:06:22.285
trigger.dev.

00:06:22.285 --> 00:06:24.125
this is a really popular background task.

00:06:24.125 --> 00:06:25.005
They kind of rebranded,

00:06:25.005 --> 00:06:27.045
they're now saying background jobs and AI

00:06:27.285 --> 00:06:28.125
infrastructure.

00:06:28.125 --> 00:06:31.204
So lots of people use this for building out

00:06:31.204 --> 00:06:32.645
workflows that interface with,

00:06:32.875 --> 00:06:33.875
AI providers.

00:06:33.875 --> 00:06:36.435
And what I've noticed is tons and tons of people

00:06:36.435 --> 00:06:36.955
that like,

00:06:36.955 --> 00:06:38.795
commit to the Vercel ecosystem,

00:06:39.035 --> 00:06:41.115
they end up using this as a secondary product.

00:06:41.355 --> 00:06:42.935
Just because Vercel doesn't have

00:06:42.935 --> 00:06:45.645
Some type of durable execution engine the way that

00:06:45.885 --> 00:06:45.915
Vercel,

00:06:46.385 --> 00:06:48.585
or the way that Cloudflare and other providers do.

00:06:48.585 --> 00:06:48.945
So

00:06:49.505 --> 00:06:50.185
the main difference,

00:06:50.185 --> 00:06:50.385
like,

00:06:50.385 --> 00:06:50.705
I think,

00:06:50.705 --> 00:06:53.065
I do think that I haven't used trigger.dev,

00:06:53.065 --> 00:06:54.985
but I have seen some different use cases for it.

00:06:54.985 --> 00:06:56.665
They do seem to have a really great developer

00:06:56.665 --> 00:06:56.945
experience.

00:06:57.025 --> 00:06:58.945
It's just the pricing is kind of crazy.

00:06:58.945 --> 00:07:00.785
Like you're kind of locked in at a

00:07:01.395 --> 00:07:02.675
monthly amount and then,

00:07:02.835 --> 00:07:03.275
you know,

00:07:03.275 --> 00:07:03.515
like,

00:07:03.515 --> 00:07:05.595
you only have 25 concurrent runs.

00:07:05.595 --> 00:07:06.675
So it really,

00:07:06.755 --> 00:07:07.155
like,

00:07:07.395 --> 00:07:09.635
I think that in terms of this type of product,

00:07:09.715 --> 00:07:11.475
Cloudflare has one of the better ones with

00:07:11.475 --> 00:07:12.075
workflows.

00:07:12.075 --> 00:07:14.235
And it's kind of crazy that they're able to spin

00:07:14.235 --> 00:07:15.395
up these products,

00:07:15.395 --> 00:07:17.795
these like sub products inside of their ecosystem

00:07:17.795 --> 00:07:19.755
so easily because they have durable objects,

00:07:19.755 --> 00:07:21.734
and durable objects are such a useful tool.

00:07:21.734 --> 00:07:21.996
All right,

00:07:21.996 --> 00:07:23.996
so enough rambling about workflows.

00:07:23.996 --> 00:07:26.196
Let's actually start to dig in and implement this

00:07:26.196 --> 00:07:26.693
use case.

