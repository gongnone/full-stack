WEBVTT
X-TIMESTAMP-MAP=LOCAL:00:00:00.000,MPEGTS:900000

00:00:00.071 --> 00:00:02.351
So now that we have a workflow deployed that has a

00:00:02.351 --> 00:00:04.071
single step returning dummy data,

00:00:04.071 --> 00:00:04.551
right now,

00:00:04.631 --> 00:00:06.551
let's build out the actual logic to,

00:00:07.111 --> 00:00:08.791
render these web pages,

00:00:08.871 --> 00:00:11.751
extract the content and then provide it so it can

00:00:11.751 --> 00:00:14.471
be used for a subsequent step in this workflow.

00:00:14.951 --> 00:00:15.231
Now,

00:00:15.231 --> 00:00:16.311
in order to actually,

00:00:16.311 --> 00:00:16.631
like,

00:00:16.631 --> 00:00:18.151
manage this browser rendering,

00:00:18.231 --> 00:00:20.791
Cloudflare has a pretty good product right out of

00:00:20.791 --> 00:00:21.271
the box.

00:00:21.381 --> 00:00:23.021
it's just called browser rendering.

00:00:23.021 --> 00:00:23.381
And

00:00:24.081 --> 00:00:24.921
what you can do is like,

00:00:24.921 --> 00:00:26.641
they have an API that you can basically like,

00:00:26.641 --> 00:00:29.121
feed in a webpage and call different endpoints to

00:00:29.121 --> 00:00:30.711
pull information about a web page.

00:00:30.711 --> 00:00:31.651
a lot of people like,

00:00:31.651 --> 00:00:34.171
just need like a PDF or a screenshot of a page,

00:00:34.201 --> 00:00:34.871
or like the content.

00:00:35.531 --> 00:00:36.131
but sometimes,

00:00:36.131 --> 00:00:36.291
like,

00:00:36.291 --> 00:00:37.931
you need to do more sophisticated

00:00:38.251 --> 00:00:41.291
types of operations on a specific web page.

00:00:41.291 --> 00:00:42.611
And in order to do that,

00:00:42.611 --> 00:00:44.131
there's a lot of different libraries and

00:00:44.131 --> 00:00:46.611
frameworks out there that give you the ability to,

00:00:46.611 --> 00:00:46.891
like,

00:00:46.891 --> 00:00:48.851
listen to events that are happening on a web page.

00:00:48.851 --> 00:00:49.851
So you could basically say,

00:00:50.131 --> 00:00:50.851
load a webpage,

00:00:50.851 --> 00:00:52.691
wait for all the network requests to,

00:00:52.911 --> 00:00:53.311
stop,

00:00:53.551 --> 00:00:56.111
wait for the page to fully load and then call,

00:00:56.431 --> 00:00:58.591
extract an element from a page or take a picture

00:00:58.591 --> 00:00:58.911
or,

00:00:59.791 --> 00:01:00.271
you know,

00:01:00.271 --> 00:01:02.871
rip all of the text or the HTML.

00:01:02.871 --> 00:01:04.271
So there's a lot that you can do and

00:01:04.651 --> 00:01:06.171
different libraries to facilitate that.

00:01:06.171 --> 00:01:07.611
Now one of the libraries that's really,

00:01:07.611 --> 00:01:09.091
really popular is Puppeteer.

00:01:09.091 --> 00:01:10.671
Puppeteer is just that it basically,

00:01:11.161 --> 00:01:11.881
helps you

00:01:12.281 --> 00:01:14.681
programmatically render a web page and then

00:01:15.341 --> 00:01:15.661
action.

00:01:15.661 --> 00:01:16.381
So you could like,

00:01:16.381 --> 00:01:17.661
navigate to a new page.

00:01:17.741 --> 00:01:18.321
you could like,

00:01:18.321 --> 00:01:20.081
listen to events that are happening on a pa.

00:01:20.541 --> 00:01:21.021
It's honestly,

00:01:21.021 --> 00:01:22.141
it's a very dense library.

00:01:22.231 --> 00:01:22.701
also very,

00:01:22.701 --> 00:01:23.421
very popular.

00:01:23.501 --> 00:01:24.781
Now Cloudflare

00:01:26.081 --> 00:01:26.401
has,

00:01:26.649 --> 00:01:29.049
a Puppeteer Cloudflare fork.

00:01:29.129 --> 00:01:30.809
So what they've done is they've gone into

00:01:30.809 --> 00:01:32.569
Cloudflare and they've kind of forked it and just

00:01:32.569 --> 00:01:32.809
made it.

00:01:32.809 --> 00:01:34.889
So it's like very compatible with the way that

00:01:34.889 --> 00:01:36.409
they implemented browser rendering.

00:01:36.409 --> 00:01:38.089
And then what they've done is they've kind of like

00:01:38.089 --> 00:01:40.169
provided a really clear entry point so you can

00:01:40.249 --> 00:01:43.009
pass in a browser binding that you define inside

00:01:43.009 --> 00:01:44.329
of your Wrangler configuration.

00:01:44.719 --> 00:01:45.119
And then,

00:01:45.459 --> 00:01:46.619
it's really just this simple.

00:01:46.619 --> 00:01:47.099
It's like,

00:01:47.099 --> 00:01:47.459
hey,

00:01:47.459 --> 00:01:49.059
I want to define a browser,

00:01:49.059 --> 00:01:51.099
and then I'm going to say browser,

00:01:51.099 --> 00:01:51.539
new page.

00:01:51.539 --> 00:01:52.659
So you open up a new page.

00:01:52.719 --> 00:01:55.169
this is just programmatically virtually opening up

00:01:55.169 --> 00:01:55.729
a new page.

00:01:55.729 --> 00:01:56.249
And then,

00:01:56.709 --> 00:01:57.069
you're saying,

00:01:57.069 --> 00:01:58.309
await page goto.

00:01:58.309 --> 00:02:00.269
So you pass in a URL and it goes to that page.

00:02:00.269 --> 00:02:02.469
And then this is giving you some page metrics and

00:02:02.469 --> 00:02:03.269
you're closing the page.

00:02:03.269 --> 00:02:04.349
Now we're going to be doing

00:02:04.669 --> 00:02:05.709
a lot of other stuff.

00:02:05.709 --> 00:02:07.269
Like we're not just going to be extracting like

00:02:07.269 --> 00:02:08.549
performance metrics of a page.

00:02:08.549 --> 00:02:09.389
We're going to be,

00:02:10.229 --> 00:02:11.469
listening to network calls,

00:02:11.469 --> 00:02:12.429
getting the page to load,

00:02:12.429 --> 00:02:13.549
and then downloading content.

00:02:13.549 --> 00:02:15.244
So we could pass it off to an AI model.

00:02:15.897 --> 00:02:16.217
Now,

00:02:16.217 --> 00:02:18.537
before we actually start writing the code to this,

00:02:18.617 --> 00:02:21.007
let's just look at one call out here,

00:02:21.007 --> 00:02:23.287
that I do think is important to note just so you

00:02:23.287 --> 00:02:24.687
can have some context in the future.

00:02:24.757 --> 00:02:26.387
if you come over to limits,

00:02:26.627 --> 00:02:29.107
what you're going to notice is on the paid tier,

00:02:29.107 --> 00:02:30.467
which is what we're currently on,

00:02:30.936 --> 00:02:32.136
they do have a,

00:02:33.042 --> 00:02:36.002
they have a limit on the concurrent browsers that

00:02:36.002 --> 00:02:38.602
are currently like running at a given point in

00:02:38.602 --> 00:02:38.882
time.

00:02:39.042 --> 00:02:39.442
So,

00:02:39.742 --> 00:02:41.102
you can see that there's 10 per account.

00:02:41.102 --> 00:02:42.582
And they say that they're like always,

00:02:43.482 --> 00:02:45.042
they say that they're always like reevaluating

00:02:45.042 --> 00:02:46.242
these limits and they're going to be higher.

00:02:46.242 --> 00:02:48.122
You could also request an increase.

00:02:48.282 --> 00:02:49.762
Now for this use case,

00:02:49.762 --> 00:02:51.842
this is kind of one where like 10 concurrent

00:02:51.842 --> 00:02:54.442
requests technically wouldn't scale if this was a

00:02:54.442 --> 00:02:56.842
SaaS product used by a ton of people with a ton of

00:02:56.842 --> 00:02:57.882
links and a ton of traffic.

00:02:57.882 --> 00:02:58.202
Right.

00:02:58.432 --> 00:03:00.192
we're going to use this anyways because,

00:03:01.442 --> 00:03:03.322
really like what we're doing is we're just

00:03:03.322 --> 00:03:05.752
simplifying the setup of Puppeteer,

00:03:05.752 --> 00:03:07.842
and like a virtual browser render because they

00:03:07.842 --> 00:03:08.962
provide that product for us.

00:03:08.962 --> 00:03:09.322
And

00:03:09.642 --> 00:03:10.202
honestly,

00:03:10.202 --> 00:03:10.962
10 concurrent,

00:03:10.962 --> 00:03:12.842
you could probably scale this to a certain point.

00:03:12.842 --> 00:03:15.202
I'm actually using browser rendering for a client

00:03:15.202 --> 00:03:15.642
right now.

00:03:15.642 --> 00:03:16.042
And

00:03:16.472 --> 00:03:16.682
you know,

00:03:16.682 --> 00:03:18.122
we have several hundred users.

00:03:18.122 --> 00:03:19.282
It's a pretty active product.

00:03:19.442 --> 00:03:19.842
And

00:03:20.272 --> 00:03:21.942
this is able to scale just because like,

00:03:21.942 --> 00:03:23.742
10 concurrent is still a lot and usually these

00:03:23.742 --> 00:03:24.902
operations don't take very long.

00:03:24.902 --> 00:03:26.342
But do keep that in mind.

00:03:26.342 --> 00:03:28.962
Now if you wanted to build out a more robust,

00:03:29.462 --> 00:03:32.142
a more robust solution that utilizes browser

00:03:32.142 --> 00:03:32.662
rendering,

00:03:32.822 --> 00:03:33.382
technically,

00:03:33.382 --> 00:03:36.502
the browser rendering platform that Cloudflare

00:03:36.502 --> 00:03:38.782
developed is built on top of Cloudflare

00:03:38.782 --> 00:03:39.222
Containers.

00:03:39.222 --> 00:03:41.182
And now that Cloudflare Containers is in beta,

00:03:41.182 --> 00:03:42.552
but it is released,

00:03:42.552 --> 00:03:44.728
you essentially just get like access to

00:03:45.048 --> 00:03:46.008
virtual machines.

00:03:46.178 --> 00:03:46.568
and

00:03:47.208 --> 00:03:47.768
you can,

00:03:47.928 --> 00:03:48.368
you know,

00:03:48.368 --> 00:03:49.208
using Docker,

00:03:49.208 --> 00:03:51.328
define the type of environment that you want and

00:03:51.328 --> 00:03:52.168
you could build out,

00:03:52.168 --> 00:03:52.648
you could

00:03:53.178 --> 00:03:55.138
install all the dependencies for Puppeteer or

00:03:55.138 --> 00:03:56.058
whatever you want to use,

00:03:56.518 --> 00:03:56.958
and then,

00:03:57.278 --> 00:03:57.758
you know,

00:03:57.758 --> 00:03:58.558
virtually render

00:03:59.038 --> 00:04:01.558
these web pages and browsers inside of a

00:04:01.558 --> 00:04:01.958
container.

00:04:01.958 --> 00:04:03.478
And then these containers don't have the same

00:04:03.478 --> 00:04:03.838
limits.

00:04:03.838 --> 00:04:04.318
So you could,

00:04:04.318 --> 00:04:04.638
you know,

00:04:04.638 --> 00:04:04.878
like,

00:04:04.878 --> 00:04:05.438
scale this

00:04:05.998 --> 00:04:07.118
quite infinitely.

00:04:07.118 --> 00:04:07.758
Not infinitely,

00:04:07.758 --> 00:04:09.478
but you could really scale this depending on your

00:04:09.478 --> 00:04:09.878
use case.

00:04:09.878 --> 00:04:10.238
So,

00:04:10.398 --> 00:04:12.118
what I like to do is I like to start with browser

00:04:12.118 --> 00:04:12.478
rendering,

00:04:12.478 --> 00:04:14.038
because it just takes minutes to set up.

00:04:14.278 --> 00:04:16.118
And once you hit critical scale,

00:04:16.198 --> 00:04:16.718
you can actually,

00:04:16.718 --> 00:04:16.958
like,

00:04:16.958 --> 00:04:18.478
start looking at an alternative,

00:04:18.618 --> 00:04:20.418
probably containers or something else if you

00:04:20.418 --> 00:04:22.298
wanted to build out a more robust

00:04:22.798 --> 00:04:24.558
solution that didn't have this limit.

00:04:24.558 --> 00:04:26.398
But we are not really going to have to worry about

00:04:26.398 --> 00:04:27.068
this limit for now.

00:04:27.231 --> 00:04:28.991
So to get started with browser rendering,

00:04:29.001 --> 00:04:30.061
we can just go to get started

00:04:30.621 --> 00:04:32.541
and it looks like they're going to have an example

00:04:32.541 --> 00:04:33.021
right here.

00:04:33.321 --> 00:04:34.601
we're going to ignore this

00:04:34.921 --> 00:04:36.921
and what we're going to want to do is we're going

00:04:36.921 --> 00:04:39.241
to want to make sure we have Puppeteer installed.

00:04:39.481 --> 00:04:40.761
So let's grab,

00:04:41.721 --> 00:04:43.321
let's make sure we have that installed.

00:04:43.401 --> 00:04:45.321
So we are in data service right now.

00:04:47.481 --> 00:04:49.401
I'm going to install that and then,

00:04:50.781 --> 00:04:52.861
I don't think we actually need to create a

00:04:53.261 --> 00:04:54.141
KV space.

00:04:54.229 --> 00:04:56.149
It looks like for this example they are just

00:04:56.789 --> 00:04:59.429
using a KV space to like store some information

00:04:59.429 --> 00:05:00.109
about your,

00:05:00.109 --> 00:05:01.029
your browser render.

00:05:01.189 --> 00:05:02.709
We're going to ignore that for now.

00:05:03.029 --> 00:05:05.189
All we're going to need to do is we're going to

00:05:05.189 --> 00:05:08.279
need to add this binding in our wrangler.or in our

00:05:08.279 --> 00:05:09.369
wrangler JSON c.

00:05:09.449 --> 00:05:09.849
So

00:05:11.049 --> 00:05:13.209
let's head over to our wrangler JSON.

00:05:13.209 --> 00:05:13.409
See,

00:05:13.409 --> 00:05:14.179
it looks like I already have it up

00:05:14.331 --> 00:05:16.171
and I'm just going to go to the top over here and

00:05:16.171 --> 00:05:17.131
I'm going to say

00:05:18.276 --> 00:05:18.848
browser

00:05:18.952 --> 00:05:19.352
and

00:05:19.513 --> 00:05:20.831
I'm going to give it a binding.

00:05:20.831 --> 00:05:22.591
So we can provide a single binding.

00:05:22.591 --> 00:05:24.071
And this is going to be.

00:05:24.311 --> 00:05:25.391
What are we going to call this?

00:05:25.391 --> 00:05:26.211
Let's just call this,

00:05:32.937 --> 00:05:34.777
we're just going to call this virtual browser.

00:05:34.857 --> 00:05:35.217
Now,

00:05:35.217 --> 00:05:37.457
since we are in our data service directory right

00:05:37.457 --> 00:05:37.657
now,

00:05:37.657 --> 00:05:39.657
we can say pnpm run CF

00:05:41.097 --> 00:05:42.217
type gen

00:05:42.584 --> 00:05:45.304
and what we're going to notice is we now have this

00:05:45.464 --> 00:05:47.384
virtual browser binding,

00:05:47.534 --> 00:05:50.014
that's specified inside of our Cloudflare

00:05:50.014 --> 00:05:50.334
environment.

00:05:51.774 --> 00:05:53.134
So inside of our code,

00:05:53.134 --> 00:05:53.934
what we can do

00:05:54.254 --> 00:05:54.654
is,

00:05:55.444 --> 00:05:57.924
essentially wherever we have access to our emv,

00:05:58.244 --> 00:05:58.451
we

00:05:58.452 --> 00:06:00.497
We can also access our virtual browser,

00:06:00.727 --> 00:06:01.237
binding.

00:06:01.237 --> 00:06:03.597
So what we want to do here is let's just,

00:06:03.597 --> 00:06:06.357
let's just show really quick what we can do so we

00:06:06.357 --> 00:06:08.117
can say this dot emv.

00:06:08.117 --> 00:06:10.837
Now we are inside of our workflow right now and

00:06:10.837 --> 00:06:12.597
what you're going to notice is we now have our

00:06:12.597 --> 00:06:15.237
virtual browser and that virtual browser is going

00:06:15.237 --> 00:06:16.317
to have a fetch handler.

00:06:16.317 --> 00:06:18.037
But if we look at how they implement,

00:06:18.897 --> 00:06:20.657
how they implement this with Puppeteer,

00:06:21.137 --> 00:06:23.017
they're basically just saying we're going to be

00:06:23.017 --> 00:06:23.457
passing,

00:06:23.457 --> 00:06:25.297
we're going to import Puppeteer and we're going to

00:06:25.297 --> 00:06:26.417
be passing that into

00:06:27.057 --> 00:06:28.587
a launch method,

00:06:28.587 --> 00:06:31.049
from the Puppeteer Cloudflare library.

00:06:31.280 --> 00:06:33.440
So let's make sure that we have that imported

00:06:33.440 --> 00:06:33.760
here.

00:06:34.479 --> 00:06:36.680
This is importing Puppeteer and then I'm just

00:06:36.680 --> 00:06:38.320
going to copy these two lines.

00:06:38.560 --> 00:06:38.960
So,

00:06:40.430 --> 00:06:41.910
they called this virtual browser.

00:06:41.910 --> 00:06:45.230
We're just going to say this emv.virtual browser.

00:06:45.230 --> 00:06:47.790
So essentially we're passing in our browser

00:06:47.790 --> 00:06:50.790
binding into this Puppeteer launch and then we are

00:06:50.790 --> 00:06:52.110
creating a new page here.

00:06:52.270 --> 00:06:52.346
So

00:06:52.347 --> 00:06:54.337
Now with this code we've actually successfully

00:06:54.337 --> 00:06:55.577
launched when this runs,

00:06:55.577 --> 00:06:57.017
we've launched a browser page.

00:06:57.017 --> 00:07:00.257
Now we can do some other stuff like we can await

00:07:00.257 --> 00:07:00.977
page go to.

00:07:00.977 --> 00:07:03.217
And you notice this autocomplete for me is looking

00:07:03.217 --> 00:07:04.577
for payload URL,

00:07:04.577 --> 00:07:06.977
but we don't know the type of the payload yet.

00:07:07.057 --> 00:07:09.057
And that's because we haven't defined that.

00:07:09.137 --> 00:07:11.297
So what we're going to want to do is we're going

00:07:11.297 --> 00:07:12.737
to want to head over to our

00:07:14.026 --> 00:07:14.586
to our

00:07:14.906 --> 00:07:17.028
service bindings that we've defined here.

00:07:17.028 --> 00:07:19.390
And this is just extending our cloudflare,

00:07:19.900 --> 00:07:20.780
our Cloudflare

00:07:21.100 --> 00:07:21.820
emv.

00:07:21.900 --> 00:07:22.300
Now

00:07:22.620 --> 00:07:23.660
what I do,

00:07:23.660 --> 00:07:25.340
or this is kind of like a pattern that I like to

00:07:25.340 --> 00:07:27.100
follow is I like to create an interface.

00:07:27.100 --> 00:07:29.700
And because this type is defined inside of my

00:07:29.700 --> 00:07:30.780
TypeScript config,

00:07:31.420 --> 00:07:31.460
this

00:07:31.560 --> 00:07:33.080
is going to be accessible throughout the whole

00:07:33.080 --> 00:07:33.360
project.

00:07:33.840 --> 00:07:34.400
And then,

00:07:36.924 --> 00:07:39.564
and then we can use it inside of our destination

00:07:39.804 --> 00:07:41.244
evaluation workflow.

00:07:41.244 --> 00:07:44.484
So where we have this time this specific unknown

00:07:44.484 --> 00:07:46.764
type we can pass in our

00:07:48.944 --> 00:07:51.784
we can pass in our interface that we just defined

00:07:51.784 --> 00:07:51.984
here.

00:07:51.984 --> 00:07:53.824
And this interface is taking a link id,

00:07:54.224 --> 00:07:56.464
destination URL and account id.

00:07:56.464 --> 00:07:58.344
So when we actually run this workflow

00:07:58.344 --> 00:07:59.024
programmatically,

00:07:59.184 --> 00:08:00.704
this is the information that we're going to be

00:08:00.704 --> 00:08:01.824
passing into the workflow.

00:08:01.824 --> 00:08:02.224
So

00:08:03.394 --> 00:08:05.874
what we can do here is now we should be able to

00:08:05.874 --> 00:08:08.234
say payload and it actually has that type,

00:08:08.234 --> 00:08:10.354
so we can pass in the destination URL,

00:08:10.354 --> 00:08:11.554
which is pretty nifty.

00:08:11.714 --> 00:08:12.114
So

00:08:12.514 --> 00:08:13.114
the last

00:08:13.434 --> 00:08:16.634
little bit of what we want to do here is we are

00:08:16.634 --> 00:08:17.994
going to basically say

00:08:18.514 --> 00:08:19.092
we're gonna

00:08:19.092 --> 00:08:20.932
go to the destination URL

00:08:22.576 --> 00:08:23.856
and we're going to get that response.

00:08:24.261 --> 00:08:26.834
And then what we want to do is we're going to want

00:08:26.834 --> 00:08:27.994
to wait for the page

00:08:28.314 --> 00:08:29.354
to be done loading,

00:08:29.354 --> 00:08:31.114
we're going to want to wait for all the requests

00:08:31.114 --> 00:08:31.754
to complete.

00:08:31.914 --> 00:08:32.314
So

00:08:32.644 --> 00:08:34.654
Puppeteer has a handy method for that.

00:08:34.654 --> 00:08:36.573
It's wait for network idle.

00:08:36.573 --> 00:08:38.854
So basically no more requests are being issued.

00:08:39.254 --> 00:08:41.854
And then what we're going to do is we are going to

00:08:41.854 --> 00:08:44.334
use the page and we're going to run an email on it

00:08:44.334 --> 00:08:46.214
and we're going to extract the body.

00:08:46.374 --> 00:08:46.954
So I'm

00:08:46.994 --> 00:08:47.514
a webpage,

00:08:47.514 --> 00:08:48.754
if you should be familiar,

00:08:49.174 --> 00:08:51.534
basically has an HTML block and inside the HTML

00:08:51.534 --> 00:08:52.134
block has a body.

00:08:52.134 --> 00:08:54.574
And that body contains basically the whole content

00:08:54.574 --> 00:08:55.174
for the site,

00:08:55.334 --> 00:08:56.854
so or for the page.

00:08:57.014 --> 00:08:58.374
So essentially what we're going to do is we're

00:08:58.374 --> 00:08:59.694
going to say page eval,

00:08:59.694 --> 00:09:01.694
we're going to extract the body element,

00:09:01.694 --> 00:09:03.814
and then we're going to get all of the inner text.

00:09:03.894 --> 00:09:06.894
So this is just going to be like a raw dump of the

00:09:06.894 --> 00:09:07.254
text.

00:09:07.414 --> 00:09:07.974
And then,

00:09:08.684 --> 00:09:11.164
I also am going to extract just like the content

00:09:11.244 --> 00:09:11.684
itself.

00:09:11.684 --> 00:09:14.004
So this is going to be like the entire HTML block.

00:09:14.004 --> 00:09:14.844
So we're saying page.

00:09:14.844 --> 00:09:15.804
This is our web page

00:09:16.174 --> 00:09:16.414
content.

00:09:16.424 --> 00:09:16.994
this is another,

00:09:17.764 --> 00:09:19.428
method that Puppeteer provides us.

00:09:19.428 --> 00:09:21.090
And then also something that's going to be

00:09:21.090 --> 00:09:22.650
important is going to be the status.

00:09:22.650 --> 00:09:23.050
Because,

00:09:23.050 --> 00:09:23.330
like,

00:09:23.330 --> 00:09:24.650
if a Status is a404,

00:09:24.650 --> 00:09:25.530
like the page isn't found,

00:09:25.530 --> 00:09:27.050
you probably don't need to actually render,

00:09:27.130 --> 00:09:27.450
like,

00:09:27.450 --> 00:09:29.490
pass it through AI because you know that that page

00:09:29.490 --> 00:09:30.730
isn't found and you can just,

00:09:31.000 --> 00:09:32.490
alert the user based upon that.

00:09:32.490 --> 00:09:33.770
So this is just going to basically,

00:09:33.770 --> 00:09:34.010
like,

00:09:34.010 --> 00:09:35.930
make our system a little bit more intelligent.

00:09:36.740 --> 00:09:37.140
now

00:09:37.234 --> 00:09:39.021
we're going to return that information here,

00:09:39.181 --> 00:09:39.581
so

00:09:40.071 --> 00:09:41.271
I'm going to just dump that here.

00:09:41.751 --> 00:09:42.871
So just to recap here,

00:09:42.871 --> 00:09:44.791
now we have a collected data,

00:09:45.251 --> 00:09:46.471
we have our collected data,

00:09:47.061 --> 00:09:48.341
variable that

00:09:48.821 --> 00:09:51.701
is getting the return value of our very first step

00:09:51.861 --> 00:09:52.821
in our workflow.

00:09:52.821 --> 00:09:54.861
And the step is rendering browser.

00:09:54.861 --> 00:09:56.021
Is rendering a.

00:09:56.341 --> 00:09:59.341
Is using a virtual browser to render a web page to

00:09:59.341 --> 00:10:00.261
extract the information.

00:10:00.901 --> 00:10:03.341
Then we're passing in our virtual browser or a

00:10:03.341 --> 00:10:04.101
remote browser

00:10:04.441 --> 00:10:06.201
into a Puppeteer instance

00:10:06.601 --> 00:10:08.121
that's going to give us this browser.

00:10:08.201 --> 00:10:10.201
And then we're going to say we want to define a

00:10:10.201 --> 00:10:10.681
new page.

00:10:11.081 --> 00:10:12.121
We are going to,

00:10:12.321 --> 00:10:14.601
load that new page or go to that new page,

00:10:14.841 --> 00:10:15.561
and then

00:10:15.663 --> 00:10:18.033
we're going to wait for all of the network to be

00:10:18.033 --> 00:10:19.314
idle so the page is fully loaded.

00:10:19.314 --> 00:10:20.754
And there's other things that you can do to ensure

00:10:20.754 --> 00:10:21.634
the page is fully loaded.

00:10:21.634 --> 00:10:23.394
There's a bunch of methods that you can define

00:10:23.794 --> 00:10:24.994
on top of Puppeteer,

00:10:25.254 --> 00:10:26.914
we're going to extract the raw body

00:10:27.474 --> 00:10:27.794
text,

00:10:27.794 --> 00:10:29.794
so all of the inner text inside of the body of the

00:10:29.794 --> 00:10:30.354
web page.

00:10:30.354 --> 00:10:32.034
And then we're also going to get like the actual

00:10:32.034 --> 00:10:34.194
HTML content there and we're going to get the

00:10:34.194 --> 00:10:35.794
status and then we're going to return it.

00:10:35.874 --> 00:10:38.394
So that's a recap of what this is doing now.

00:10:38.394 --> 00:10:41.434
We should be able to actually deploy this and see

00:10:41.434 --> 00:10:41.954
it working,

00:10:42.434 --> 00:10:44.474
inside of the Cloudflare dashboard when we run.

00:10:44.474 --> 00:10:48.120
So I'm going to say pnpm run deployment.

00:10:48.310 --> 00:10:50.270
So now that this is successfully deployed,

00:10:50.270 --> 00:10:53.310
let's head back over to our workflow dashboard

00:10:53.310 --> 00:10:55.230
inside of our Cloudflare dashboard and let's

00:10:55.230 --> 00:10:56.150
trigger a new instance.

00:10:56.150 --> 00:10:58.150
Now I just have this example,

00:10:58.530 --> 00:11:01.370
I just have this example input of the parameters,

00:11:01.370 --> 00:11:03.370
essentially the exact same parameters that we've

00:11:03.370 --> 00:11:04.970
defined as this interface.

00:11:04.970 --> 00:11:05.530
Link id,

00:11:05.530 --> 00:11:07.170
destination URL and account id.

00:11:07.730 --> 00:11:08.130
And

00:11:08.590 --> 00:11:10.470
what I'm going to do is I'm going to say let's go

00:11:10.470 --> 00:11:11.230
to my website,

00:11:11.790 --> 00:11:13.070
backpine.com

00:11:14.299 --> 00:11:16.099
and essentially when this workflow runs,

00:11:16.099 --> 00:11:17.659
it should grab this destination URL,

00:11:17.659 --> 00:11:19.939
should go to backpine.com and we should see some

00:11:19.939 --> 00:11:20.379
of the

00:11:21.349 --> 00:11:22.869
text body from that site.

00:11:23.109 --> 00:11:24.829
So this is now queued,

00:11:24.829 --> 00:11:26.469
I'm going to refresh it because the

00:11:26.948 --> 00:11:28.629
dashboard isn't totally real time.

00:11:28.739 --> 00:11:29.989
so this is currently running.

00:11:30.149 --> 00:11:31.949
Refresh it one more time and it should be

00:11:31.949 --> 00:11:32.469
complete.

00:11:32.679 --> 00:11:33.193
All right,

00:11:33.193 --> 00:11:34.353
so this is now completed.

00:11:34.353 --> 00:11:36.953
So what we can do is we can look at the actual

00:11:36.953 --> 00:11:38.623
body that was outputted and this is,

00:11:39.013 --> 00:11:39.893
this was defined here,

00:11:39.893 --> 00:11:42.213
so it was returned as the body text.

00:11:42.213 --> 00:11:45.333
And you can see that this is the body text from

00:11:45.733 --> 00:11:47.813
my actual like website currently.

00:11:47.893 --> 00:11:50.493
And the output's obviously truncated just because

00:11:50.493 --> 00:11:51.369
like they're not gonna,

00:11:51.369 --> 00:11:53.030
they're not gonna let you like display all this

00:11:53.030 --> 00:11:53.310
data.

00:11:53.310 --> 00:11:53.710
But

00:11:54.109 --> 00:11:55.990
what we're eventually gonna do is we're gonna pass

00:11:55.990 --> 00:11:58.230
this information into an AI model and then we're

00:11:58.230 --> 00:11:59.630
also going to back up this,

00:11:59.740 --> 00:12:02.550
the data that we pull here in R2 for object

00:12:02.550 --> 00:12:03.030
storage.

00:12:03.030 --> 00:12:03.270
Really,

00:12:03.270 --> 00:12:04.390
really cheap object storage.

00:12:04.390 --> 00:12:06.870
So at this point what we have is we have

00:12:07.230 --> 00:12:08.070
successfully the

00:12:09.440 --> 00:12:10.000
render out,

00:12:10.210 --> 00:12:11.410
to launch a browser,

00:12:11.410 --> 00:12:12.130
render the page,

00:12:12.130 --> 00:12:14.210
click the info from the page and then return it

00:12:14.210 --> 00:12:14.610
here.

00:12:14.610 --> 00:12:16.450
So subsequently it could be used

00:12:16.930 --> 00:12:18.450
by other steps,

00:12:18.480 --> 00:12:19.220
in this workflow.

00:12:19.220 --> 00:12:21.700
And you can notice we're actually logging out this

00:12:21.700 --> 00:12:22.340
raw data.

00:12:22.930 --> 00:12:25.090
I'm going to open in a new tab A,

00:12:25.234 --> 00:12:27.342
I'm going to open our worker for data service over

00:12:27.342 --> 00:12:27.622
here.

00:12:27.702 --> 00:12:28.102
So

00:12:29.562 --> 00:12:32.122
you should be able to see the workflow logs here

00:12:32.122 --> 00:12:32.682
as well.

00:12:32.762 --> 00:12:33.162
So

00:12:33.672 --> 00:12:34.552
go to events.

00:12:34.952 --> 00:12:35.352
And

00:12:35.920 --> 00:12:38.402
you can see that this is actually logging out the

00:12:38.402 --> 00:12:39.202
HTML.

00:12:39.282 --> 00:12:41.242
So you can see that like we have,

00:12:41.242 --> 00:12:43.522
we've defined a log inside of the workflow and we

00:12:43.522 --> 00:12:44.962
can see the logs

00:12:45.282 --> 00:12:46.802
at the worker level,

00:12:47.072 --> 00:12:47.702
inside of here.

00:12:47.702 --> 00:12:49.982
Because this workflow is attached specifically to

00:12:49.982 --> 00:12:50.662
this worker.

00:12:50.822 --> 00:12:52.622
And that might be a little bit confusing because

00:12:52.622 --> 00:12:53.662
you might like kind of expect,

00:12:53.662 --> 00:12:53.942
oh,

00:12:53.942 --> 00:12:54.062
well,

00:12:54.062 --> 00:12:55.742
why can't I see logs at the workflow?

00:12:55.742 --> 00:12:57.742
Because I'm like analyzing data from a workflow.

00:12:57.742 --> 00:13:00.342
But just note that the logs are associated with

00:13:00.342 --> 00:13:02.492
the worker that it was deployed along with.

00:13:02.882 --> 00:13:03.122
So

00:13:03.432 --> 00:13:05.122
that's just something that's important for

00:13:05.122 --> 00:13:06.402
debugging purposes.

00:13:07.042 --> 00:13:09.882
But what we want to do now for the very last thing

00:13:09.882 --> 00:13:11.522
before we move on to the next section and actually

00:13:11.522 --> 00:13:13.002
start building up more advanced features,

00:13:13.002 --> 00:13:13.282
is

00:13:13.602 --> 00:13:16.162
I don't like to have a workflow which is like a

00:13:16.162 --> 00:13:17.602
whole bunch of stuff defined inside.

00:13:17.602 --> 00:13:20.882
I like to move everything into its own method.

00:13:20.882 --> 00:13:22.162
So that's what we're going to do.

00:13:22.402 --> 00:13:24.482
We are going to create a,

00:13:24.712 --> 00:13:25.702
we're going to basically

00:13:25.799 --> 00:13:26.759
inside of helpers,

00:13:26.839 --> 00:13:29.039
we're going to create a new file and this is going

00:13:29.039 --> 00:13:29.559
to be called

00:13:31.159 --> 00:13:31.959
browser

00:13:33.976 --> 00:13:34.456
render,

00:13:34.921 --> 00:13:35.561
ts

00:13:36.681 --> 00:13:37.081
and

00:13:37.401 --> 00:13:40.201
I am going to just so I have this code already.

00:13:40.521 --> 00:13:42.081
So essentially this is going to be doing the same

00:13:42.081 --> 00:13:42.241
thing.

00:13:42.241 --> 00:13:43.601
I'm just going to make sure we have the right

00:13:43.601 --> 00:13:44.521
binding name here.

00:13:45.081 --> 00:13:46.201
Virtual browser.

00:13:46.761 --> 00:13:47.721
And it's,

00:13:48.121 --> 00:13:49.041
it's the exact same thing.

00:13:49.041 --> 00:13:51.001
It's all the logic that we have inside of here,

00:13:51.001 --> 00:13:53.781
it's just kind of moved into its own method.

00:13:54.261 --> 00:13:55.301
And one.

00:13:55.541 --> 00:13:58.341
Also one thing to note here is I've also added a

00:13:58.341 --> 00:14:00.461
Await browser close because you're going to want

00:14:00.461 --> 00:14:02.621
to make sure you close the browser instance just

00:14:02.621 --> 00:14:04.741
so you don't like hit your 10 concurrent

00:14:05.141 --> 00:14:06.901
have to like wait for Cloudflare to kill those

00:14:06.901 --> 00:14:07.781
instances for you.

00:14:07.781 --> 00:14:08.701
So when you're done,

00:14:08.701 --> 00:14:10.341
go ahead Await close and then

00:14:10.341 --> 00:14:11.061
you should be good.

00:14:11.141 --> 00:14:14.021
So we're going to essentially come into here and

00:14:14.261 --> 00:14:15.272
delete this stuff

00:14:15.272 --> 00:14:17.092
and then I am going to return

00:14:18.022 --> 00:14:18.662
that method

00:14:19.782 --> 00:14:23.982
and I'm going to pass in this EMB and the

00:14:23.982 --> 00:14:25.302
destination URL.

00:14:25.302 --> 00:14:28.062
So this is how I try to keep the workflows really

00:14:28.062 --> 00:14:28.502
concise.

00:14:28.502 --> 00:14:28.982
You have

00:14:29.212 --> 00:14:31.522
clearly defined step and then you have a helper

00:14:31.522 --> 00:14:32.802
method that handles it in this way.

00:14:32.802 --> 00:14:34.802
If you have a workflow that has like 50 steps,

00:14:34.802 --> 00:14:36.692
it's really easy to navigate through

00:14:36.702 --> 00:14:37.220
your code.

00:14:37.623 --> 00:14:39.463
So one last thing is we can just like

00:14:39.863 --> 00:14:41.583
PMPM run deploy one more time.

00:14:41.583 --> 00:14:42.183
That's going to be,

00:14:42.183 --> 00:14:43.223
go ahead and be successful.

00:14:43.383 --> 00:14:44.863
And what we're going to do is we're going to move

00:14:44.863 --> 00:14:46.703
on to the next step where we use this collected

00:14:46.703 --> 00:14:48.323
data and we're going to pass it into

00:14:48.733 --> 00:14:50.221
an NAI use case.

