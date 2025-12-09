WEBVTT
X-TIMESTAMP-MAP=LOCAL:00:00:00.000,MPEGTS:900000

00:00:00.039 --> 00:00:00.279
All right,

00:00:00.279 --> 00:00:02.839
so now that we successfully have created this step

00:00:02.839 --> 00:00:05.999
that saves the output of our AI model into our

00:00:05.999 --> 00:00:06.919
database table,

00:00:07.159 --> 00:00:09.119
we're also going to want to create a step that

00:00:09.119 --> 00:00:11.239
takes the entire output from

00:00:11.559 --> 00:00:13.279
the collect destination info,

00:00:13.279 --> 00:00:15.239
which is using browser rendering to scrape the

00:00:15.239 --> 00:00:16.039
content of a website.

00:00:16.199 --> 00:00:17.919
And we're going to want to stick it into object

00:00:17.919 --> 00:00:18.519
storage.

00:00:18.519 --> 00:00:20.039
So that's the last step here.

00:00:20.119 --> 00:00:20.479
Now,

00:00:20.479 --> 00:00:22.319
if you're not familiar with Object storage,

00:00:22.319 --> 00:00:23.087
our R2,

00:00:23.191 --> 00:00:23.659
S3,

00:00:23.889 --> 00:00:24.569
that's okay.

00:00:24.569 --> 00:00:25.529
I know a lot of like,

00:00:25.529 --> 00:00:26.849
people that are newer to web development.

00:00:26.849 --> 00:00:27.969
They don't really understand,

00:00:28.129 --> 00:00:28.529
you know,

00:00:28.529 --> 00:00:31.809
why when you should use object storage over your

00:00:31.809 --> 00:00:32.049
like,

00:00:32.049 --> 00:00:33.169
traditional database.

00:00:33.169 --> 00:00:33.569
Now,

00:00:33.739 --> 00:00:35.829
the way that I like to kind of conceptualize it is

00:00:36.069 --> 00:00:38.709
you typically want to use your database to store

00:00:38.869 --> 00:00:39.269
information

00:00:39.749 --> 00:00:41.589
that's kind of related to like the CRUD operations

00:00:41.589 --> 00:00:42.389
of your application.

00:00:42.389 --> 00:00:43.989
So some basic user information,

00:00:44.639 --> 00:00:46.369
attributes about things that they've done on a

00:00:46.369 --> 00:00:46.649
website,

00:00:47.039 --> 00:00:47.689
IDs.

00:00:47.689 --> 00:00:47.939
The,

00:00:48.009 --> 00:00:48.129
like,

00:00:48.129 --> 00:00:48.809
what we're doing here,

00:00:48.809 --> 00:00:51.209
we're kind of like storing like an ID and a time

00:00:51.209 --> 00:00:53.969
that an evaluation took place so we could create,

00:00:53.969 --> 00:00:54.409
you know,

00:00:54.409 --> 00:00:54.729
really,

00:00:54.809 --> 00:00:57.449
really rich features in our ui,

00:00:57.669 --> 00:00:59.389
that use information in this database.

00:00:59.389 --> 00:00:59.749
Now,

00:00:59.909 --> 00:01:01.789
databases can become much,

00:01:01.789 --> 00:01:04.589
much more expensive to maintain if you stuff very

00:01:04.589 --> 00:01:06.389
large amounts of data inside of them.

00:01:06.469 --> 00:01:06.869
And

00:01:07.279 --> 00:01:07.949
in order to,

00:01:07.949 --> 00:01:08.349
for one,

00:01:08.349 --> 00:01:09.949
from like a cost perspective and then two,

00:01:09.949 --> 00:01:11.429
from a performance perspective,

00:01:11.429 --> 00:01:13.429
if you're going to be storing like really large

00:01:13.509 --> 00:01:13.909
files,

00:01:13.909 --> 00:01:16.149
like videos or images or large like

00:01:16.509 --> 00:01:17.549
HTML documents,

00:01:17.549 --> 00:01:19.589
you're not going to usually want to stuff it

00:01:19.589 --> 00:01:21.709
inside of your Postgres database or MySQL or

00:01:21.709 --> 00:01:22.789
SQLite database.

00:01:22.789 --> 00:01:24.309
You're typically going to want to stuff that

00:01:24.309 --> 00:01:26.509
information in object storage and then in your

00:01:26.509 --> 00:01:28.989
database kind of have an ID that references,

00:01:29.489 --> 00:01:31.349
the object that is stored inside of object

00:01:31.349 --> 00:01:31.849
Storage.

00:01:31.849 --> 00:01:32.709
that way you can like,

00:01:32.709 --> 00:01:33.149
you know,

00:01:33.149 --> 00:01:35.389
have a query that shows here's all of the files

00:01:35.389 --> 00:01:37.269
and their names and then when you click on it,

00:01:37.269 --> 00:01:38.989
it can go to object storage and it can pull that

00:01:38.989 --> 00:01:39.509
whole thing.

00:01:39.669 --> 00:01:41.149
That's going to keep costs under control.

00:01:41.149 --> 00:01:42.589
It's also going to keep the performance of your

00:01:42.589 --> 00:01:43.229
database better.

00:01:43.229 --> 00:01:45.229
And you can kind of like think about your database

00:01:45.229 --> 00:01:47.269
as indexing information that's

00:01:47.569 --> 00:01:48.529
useful for the application,

00:01:48.529 --> 00:01:49.929
but it's not like the whole picture.

00:01:50.029 --> 00:01:50.749
you want larger files,

00:01:50.749 --> 00:01:52.509
you obviously should go somewhere else for that.

00:01:52.509 --> 00:01:52.869
So,

00:01:53.108 --> 00:01:55.422
Cloudflare has an offering called R2,

00:01:55.662 --> 00:01:58.622
which is their S3 compatible object storage.

00:01:58.622 --> 00:01:59.662
Now if you don't know S3,

00:01:59.742 --> 00:02:03.182
S3 is a product that is created by AWS

00:02:03.502 --> 00:02:05.542
and they've kind of like created a standard for

00:02:05.542 --> 00:02:07.702
how files can be stored in object storage.

00:02:07.702 --> 00:02:09.382
And you store them inside of these things called

00:02:09.382 --> 00:02:09.822
buckets.

00:02:09.982 --> 00:02:11.822
And inside of a bucket you can have a whole bunch

00:02:11.822 --> 00:02:12.982
of folders with subfolders.

00:02:12.982 --> 00:02:13.702
With subfolders.

00:02:13.702 --> 00:02:14.782
And then it has a file

00:02:15.162 --> 00:02:16.442
and it kind of gives you like,

00:02:16.522 --> 00:02:16.962
you know,

00:02:16.962 --> 00:02:18.562
flexible ways of saying oh,

00:02:18.562 --> 00:02:19.802
I want to find every

00:02:20.522 --> 00:02:23.162
file or every file that's in a folder that starts

00:02:23.162 --> 00:02:24.202
with like a specific value.

00:02:24.522 --> 00:02:26.442
And you can do that but you can't write really,

00:02:26.442 --> 00:02:28.562
really robust queries of like you know,

00:02:28.562 --> 00:02:29.722
scan all these files,

00:02:29.722 --> 00:02:30.602
join by this

00:02:30.792 --> 00:02:31.442
group by this.

00:02:31.442 --> 00:02:32.562
Like you're not going to have that much

00:02:32.562 --> 00:02:33.082
flexibility.

00:02:33.292 --> 00:02:34.242
so typically what you're,

00:02:34.242 --> 00:02:35.522
the access pattern that you're going to want,

00:02:35.522 --> 00:02:37.482
going to want that's Most performant with S3 is

00:02:37.482 --> 00:02:38.002
either like

00:02:38.562 --> 00:02:40.002
save a file in S3,

00:02:40.642 --> 00:02:43.562
retrieve a file knowing the specific ID or the

00:02:43.562 --> 00:02:45.922
specific path of a file that's stored inside of

00:02:45.922 --> 00:02:46.802
your object storage.

00:02:46.802 --> 00:02:50.242
S3 or R2 in our use case or like deleting,

00:02:50.242 --> 00:02:50.562
you know,

00:02:50.562 --> 00:02:52.052
the exact file that you want to delete.

00:02:52.182 --> 00:02:53.662
are typically how you want to do operations.

00:02:53.662 --> 00:02:55.262
Now you can do bulk operations but

00:02:55.642 --> 00:02:57.362
best practice to kind of like have your database

00:02:57.362 --> 00:02:59.882
keep track of things and then use you know,

00:02:59.882 --> 00:03:02.042
the references that you get from your database to

00:03:02.042 --> 00:03:04.682
go like update or pull or delete specific files.

00:03:04.682 --> 00:03:04.880
So

00:03:04.880 --> 00:03:05.841
you know this is S3.

00:03:05.841 --> 00:03:06.241
and

00:03:06.256 --> 00:03:07.253
Cloudflare has

00:03:07.293 --> 00:03:07.533
this,

00:03:07.533 --> 00:03:09.293
this alternative which is R2.

00:03:09.293 --> 00:03:10.653
This is their object storage.

00:03:10.653 --> 00:03:10.973
And

00:03:11.453 --> 00:03:13.453
the content of the website that you're actually

00:03:13.453 --> 00:03:14.413
viewing this course on.

00:03:14.653 --> 00:03:17.153
A lot of the information is stored inside of R2.

00:03:17.312 --> 00:03:19.673
now we can say like I think they actually have a

00:03:19.673 --> 00:03:19.953
website,

00:03:20.193 --> 00:03:20.913
R2

00:03:21.713 --> 00:03:22.993
versus S3.

00:03:23.157 --> 00:03:23.557
And

00:03:23.737 --> 00:03:24.777
Cloudflare kind of put this out.

00:03:24.777 --> 00:03:26.697
So like they kind of break down like the pricing

00:03:26.697 --> 00:03:27.417
comparisons

00:03:27.737 --> 00:03:29.417
of Cloudflare versus R2.

00:03:29.417 --> 00:03:30.297
And you can see like

00:03:31.207 --> 00:03:31.847
Cloudflare,

00:03:32.087 --> 00:03:32.567
you know,

00:03:32.567 --> 00:03:33.127
storage,

00:03:33.127 --> 00:03:34.327
they're kind of breaking it down.

00:03:35.177 --> 00:03:36.497
so they're breaking it down.

00:03:36.497 --> 00:03:37.657
I think this is the free tier.

00:03:37.657 --> 00:03:39.377
So AWS has a free tier.

00:03:39.377 --> 00:03:41.057
Cloudflare has a free tier that has like,

00:03:41.057 --> 00:03:41.937
it's more generous.

00:03:41.937 --> 00:03:44.057
So you have like more class A operations

00:03:44.377 --> 00:03:46.057
like putting information in

00:03:46.457 --> 00:03:46.857
or

00:03:47.327 --> 00:03:49.147
class B operations getting information out of

00:03:49.147 --> 00:03:49.867
object storage.

00:03:49.867 --> 00:03:51.747
So they're saying like they give you 10 million

00:03:51.747 --> 00:03:54.467
per month for free where S3 only gives you 20,000.

00:03:54.627 --> 00:03:55.667
And then data transfer.

00:03:55.667 --> 00:03:57.907
This is like the big thing about R2 for data

00:03:57.907 --> 00:03:58.307
transfer.

00:03:58.307 --> 00:03:58.987
They don't bill you.

00:03:58.987 --> 00:03:59.787
Which is crazy.

00:03:59.787 --> 00:04:00.627
It really is crazy.

00:04:00.627 --> 00:04:02.047
That they don't bill you where like

00:04:02.397 --> 00:04:04.037
Amazon basically for data transfer,

00:04:04.037 --> 00:04:05.757
they're going to like have the amount of data

00:04:05.757 --> 00:04:06.317
that's transferred,

00:04:06.317 --> 00:04:07.317
they're going to charge for that.

00:04:07.317 --> 00:04:09.797
Now the pricing after the free tier you can do

00:04:09.797 --> 00:04:10.397
this comparison.

00:04:10.397 --> 00:04:12.037
And this is kind of the main thing like what

00:04:12.037 --> 00:04:13.877
everybody loves about Cloudflare is egress is

00:04:13.877 --> 00:04:14.037
free,

00:04:14.037 --> 00:04:15.037
which is kind of crazy.

00:04:15.117 --> 00:04:15.917
Whereas like they're,

00:04:15.917 --> 00:04:16.677
they're charging not,

00:04:16.677 --> 00:04:18.317
they're charging 0.09 for

00:04:18.547 --> 00:04:19.587
per gigabyte.

00:04:19.587 --> 00:04:21.667
So it can get really expensive if you're moving

00:04:21.747 --> 00:04:23.787
tons of data in and out of your object storage.

00:04:23.787 --> 00:04:26.987
But pricing wise Cloudflare does beat S3 which is

00:04:26.987 --> 00:04:27.347
awesome

00:04:27.727 --> 00:04:28.447
because you know,

00:04:28.687 --> 00:04:29.407
AWS,

00:04:30.107 --> 00:04:31.947
S3 kind of pioneered this space.

00:04:31.947 --> 00:04:33.947
But Cloudflare is able to create a compatible

00:04:33.947 --> 00:04:35.387
product that beats them in pricing.

00:04:35.387 --> 00:04:37.744
Now this product does require a credit card

00:04:37.744 --> 00:04:38.738
but as you can see here,

00:04:38.738 --> 00:04:39.498
you get 10

00:04:40.068 --> 00:04:41.108
10 gigabytes for free.

00:04:41.108 --> 00:04:42.828
So you're probably not ever going to be billed

00:04:42.828 --> 00:04:43.908
specifically for this project.

00:04:43.908 --> 00:04:46.508
But if you have like heavier workloads that you're

00:04:46.508 --> 00:04:46.788
using,

00:04:46.948 --> 00:04:47.428
you know,

00:04:47.428 --> 00:04:48.548
after this free tier,

00:04:48.548 --> 00:04:50.108
usage based billing does kick in.

00:04:50.108 --> 00:04:51.748
So you have 10 gigabytes free,

00:04:51.888 --> 00:04:53.308
100 or 1 million

00:04:53.788 --> 00:04:54.668
class A operation.

00:04:54.668 --> 00:04:55.708
So put operations

00:04:56.028 --> 00:04:57.488
and then they charge like per

00:04:57.828 --> 00:04:59.588
additional million operations and then class B

00:04:59.588 --> 00:05:00.148
operations,

00:05:00.588 --> 00:05:02.088
for which is reading files,

00:05:02.608 --> 00:05:05.348
after the first 10 million 36 cents per additional

00:05:05.348 --> 00:05:06.188
million requests.

00:05:06.188 --> 00:05:08.028
So I'm going to go ahead and put in my credit card

00:05:08.028 --> 00:05:09.348
information into here and then

00:05:09.408 --> 00:05:11.590
we'll sync back after I do that.

00:05:11.644 --> 00:05:13.724
So after you put in your credit card information

00:05:13.724 --> 00:05:15.724
or just basically say you want your account to

00:05:15.724 --> 00:05:16.764
have access to R2,

00:05:16.924 --> 00:05:18.644
you're going to be brought to a page that looks

00:05:18.644 --> 00:05:19.084
like this.

00:05:19.824 --> 00:05:21.504
and from here what we're going to do is we're

00:05:21.504 --> 00:05:22.184
going to create a bucket.

00:05:22.184 --> 00:05:23.784
And a bucket is going to contain a whole bunch of

00:05:23.784 --> 00:05:25.734
files and files inside of folders that,

00:05:25.884 --> 00:05:26.124
that

00:05:26.326 --> 00:05:26.706
we

00:05:27.026 --> 00:05:27.826
insert into,

00:05:27.906 --> 00:05:28.626
from our,

00:05:28.671 --> 00:05:31.137
from our workflow after we extract all of the

00:05:31.657 --> 00:05:34.177
data and HTML data from the browser rendering.

00:05:34.177 --> 00:05:35.817
So we're going to go ahead and say create this

00:05:35.817 --> 00:05:36.337
bucket

00:05:36.736 --> 00:05:38.817
and I'm going to call this Smart

00:05:38.995 --> 00:05:39.674
Links

00:05:40.074 --> 00:05:40.634
stage,

00:05:40.654 --> 00:05:42.514
or maybe we'll call this Smart Links

00:05:42.914 --> 00:05:44.074
Eval stage.

00:05:44.074 --> 00:05:45.674
And the reasons why I'm saying stage is because

00:05:45.674 --> 00:05:47.234
later in this course we're going to be

00:05:47.654 --> 00:05:49.174
doing a production version of this application.

00:05:49.174 --> 00:05:50.894
So you can kind of manage like two different types

00:05:50.894 --> 00:05:51.534
of deployments,

00:05:51.804 --> 00:05:53.244
and then there's some different like

00:05:54.104 --> 00:05:54.464
here.

00:05:54.464 --> 00:05:55.904
So you have automatic

00:05:55.944 --> 00:05:57.564
versus specific jurisdiction.

00:05:57.564 --> 00:05:59.204
R2 buckets can be restricted to a specific

00:05:59.204 --> 00:06:00.764
jurisdiction to meet data requirements.

00:06:00.764 --> 00:06:02.014
So like a lot of regulations,

00:06:02.544 --> 00:06:05.224
inside of Europe for GDPR you have to store data

00:06:05.464 --> 00:06:06.784
specifically where that user is.

00:06:06.784 --> 00:06:08.464
So you could go this route and you could say what

00:06:08.464 --> 00:06:09.264
region you want it in.

00:06:09.264 --> 00:06:11.544
It looks like they only do EU because of gdpr,

00:06:11.544 --> 00:06:12.504
but we're.

00:06:12.504 --> 00:06:14.184
I'm in the US so I'm really not going to worry

00:06:14.184 --> 00:06:15.024
about that at this time.

00:06:15.024 --> 00:06:17.024
And this is also just kind of like a course and

00:06:17.024 --> 00:06:18.414
this application isn't going to be used by any,

00:06:18.484 --> 00:06:18.764
anybody.

00:06:18.764 --> 00:06:19.044
But

00:06:19.454 --> 00:06:19.814
yeah,

00:06:19.814 --> 00:06:20.294
you can do that.

00:06:20.294 --> 00:06:21.534
And then they also have this

00:06:22.304 --> 00:06:23.944
they also have this feature called Infrequent

00:06:23.944 --> 00:06:24.624
Access where

00:06:25.024 --> 00:06:25.424
you

00:06:26.114 --> 00:06:28.034
it's recommended for objects that will be accessed

00:06:28.034 --> 00:06:28.754
less than once a month.

00:06:28.754 --> 00:06:29.714
And I do think that

00:06:29.804 --> 00:06:31.594
the pricing differs for this is actually cheaper

00:06:31.594 --> 00:06:33.034
if you're using Infrequent Access.

00:06:33.384 --> 00:06:34.604
but if you're using it frequently,

00:06:34.604 --> 00:06:35.844
I think the pricing is more.

00:06:35.924 --> 00:06:36.924
It's also in beta.

00:06:36.924 --> 00:06:37.924
We're not going to mess with this,

00:06:37.924 --> 00:06:40.244
but this type of workload actually might work

00:06:40.244 --> 00:06:40.644
because

00:06:41.044 --> 00:06:41.404
you know,

00:06:41.404 --> 00:06:44.084
we probably don't have to retrieve the evaluation

00:06:44.084 --> 00:06:45.524
data that we save very often.

00:06:46.034 --> 00:06:46.594
So this might,

00:06:46.594 --> 00:06:48.194
in the future when it's not in beta for this type

00:06:48.194 --> 00:06:49.634
of use case actually might be useful.

00:06:49.634 --> 00:06:51.514
But for now we're just going to be using the

00:06:51.514 --> 00:06:53.154
storage class standard and we're going to go ahead

00:06:53.154 --> 00:06:53.830
and create that bucket.

00:06:53.830 --> 00:06:55.212
Now once that bucket is created,

00:06:55.212 --> 00:06:56.012
you could use

00:06:56.212 --> 00:06:58.552
third party libraries because this is S3

00:06:58.552 --> 00:06:59.152
compatible

00:06:59.472 --> 00:06:59.872
to

00:07:00.532 --> 00:07:02.802
essentially like use those libraries to

00:07:03.122 --> 00:07:05.122
save data inside of your object storage.

00:07:05.122 --> 00:07:06.922
But we're not going to really worry about that

00:07:06.922 --> 00:07:08.762
because since we're working inside of the worker

00:07:08.762 --> 00:07:09.522
ecosystem,

00:07:09.842 --> 00:07:10.802
integrating with

00:07:11.412 --> 00:07:13.732
R2 object storage is so insanely seamless.

00:07:13.732 --> 00:07:16.012
It's actually like kind of crazy how easy it is to

00:07:16.012 --> 00:07:16.412
work with.

00:07:16.412 --> 00:07:18.172
So we're going to go ahead and create the name

00:07:18.172 --> 00:07:20.572
that we've defined for the specific bucket and

00:07:20.572 --> 00:07:22.292
we'll head back to our code base and we're going

00:07:22.292 --> 00:07:25.052
to go to our wrangler JSON C file inside of our

00:07:25.052 --> 00:07:25.652
data service.

00:07:26.052 --> 00:07:28.012
Now what I'm going to do is I'm going to say

00:07:28.012 --> 00:07:28.852
underneath

00:07:29.272 --> 00:07:29.672
the

00:07:30.152 --> 00:07:31.192
AI binding,

00:07:31.272 --> 00:07:33.232
I'm going to add another binding called R2

00:07:33.232 --> 00:07:33.752
buckets.

00:07:33.992 --> 00:07:36.392
And all we need to do is we need to give it a

00:07:36.392 --> 00:07:37.912
binding name and we'll just call this

00:07:38.162 --> 00:07:38.602
bucket.

00:07:38.602 --> 00:07:39.442
Keep it easy

00:07:40.002 --> 00:07:41.602
and then we need to specify a name.

00:07:42.722 --> 00:07:43.922
Now you could,

00:07:44.242 --> 00:07:45.282
depending on your,

00:07:45.282 --> 00:07:47.042
your workload for local development,

00:07:47.042 --> 00:07:49.522
you could enable experimental remote so,

00:07:49.772 --> 00:07:51.732
you would be able to like actually pull from that

00:07:51.732 --> 00:07:53.292
bucket while developing.

00:07:53.292 --> 00:07:54.692
But we're not going to worry about that here

00:07:54.692 --> 00:07:56.092
because this is just something we're going to kind

00:07:56.092 --> 00:07:57.042
of do after the fact.

00:07:57.402 --> 00:07:59.842
it's not going to be directly integrated into

00:07:59.842 --> 00:08:00.162
like,

00:08:00.162 --> 00:08:02.802
our application in terms of like reading files.

00:08:02.802 --> 00:08:03.162
So,

00:08:03.422 --> 00:08:04.662
this is all we have to do here.

00:08:04.662 --> 00:08:07.422
And then I'm already in the data service project,

00:08:07.662 --> 00:08:10.302
so I'm going to say pnpm run CF

00:08:11.502 --> 00:08:12.222
type gen.

00:08:12.748 --> 00:08:14.508
Now that type should be generated.

00:08:14.508 --> 00:08:16.548
What we're going to see is we have this bucket

00:08:16.548 --> 00:08:19.548
type here that is of the type R2 bucket.

00:08:19.948 --> 00:08:22.864
And if we head back over to our workflow,

00:08:22.864 --> 00:08:24.536
we're going to create one last step here.

00:08:24.536 --> 00:08:26.776
And this last step is going to be saving the

00:08:26.776 --> 00:08:27.856
information into R2.

00:08:27.856 --> 00:08:29.536
So we're going to create a step that's called I'm

00:08:29.536 --> 00:08:30.476
going to delete this log.

00:08:30.476 --> 00:08:31.916
We actually don't really need it anymore.

00:08:32.576 --> 00:08:35.496
this is going to be called Backup destination HTML

00:08:35.496 --> 00:08:36.176
in R2.

00:08:37.778 --> 00:08:40.915
And what we're going to do here is we are going to

00:08:41.475 --> 00:08:41.875
say,

00:08:42.625 --> 00:08:44.135
we're going to store everything based upon the

00:08:44.135 --> 00:08:44.735
account id.

00:08:44.975 --> 00:08:46.295
So everything will be segmented,

00:08:46.295 --> 00:08:48.055
kind of grouped inside of a folder based on an

00:08:48.055 --> 00:08:48.655
account id.

00:08:48.975 --> 00:08:51.775
We get that account ID from our payload of this

00:08:51.775 --> 00:08:52.415
workflow.

00:08:53.385 --> 00:08:56.025
Then we are going to basically specify a path.

00:08:56.185 --> 00:08:57.945
So this is going to be a path,

00:08:58.065 --> 00:09:00.305
inside of our bucket that our

00:09:00.625 --> 00:09:01.745
file is going to live.

00:09:01.985 --> 00:09:03.665
And what we're able to do here is I'm just going

00:09:03.665 --> 00:09:05.185
to basically say R2 path is going to be

00:09:05.185 --> 00:09:06.065
evaluations.

00:09:06.065 --> 00:09:07.545
So we're creating like a folder called

00:09:07.545 --> 00:09:08.385
evaluations,

00:09:08.464 --> 00:09:10.345
and then we're creating a folder inside of that

00:09:10.345 --> 00:09:11.345
with the account id.

00:09:11.585 --> 00:09:13.745
And then we're creating a specific,

00:09:13.845 --> 00:09:14.125
another.

00:09:14.205 --> 00:09:15.805
We're creating another folder,

00:09:16.395 --> 00:09:17.195
or a file,

00:09:18.305 --> 00:09:18.545
that

00:09:18.945 --> 00:09:20.585
says evaluation ID.

00:09:20.585 --> 00:09:23.545
Now we could say like.HTML if we wanted to,

00:09:23.545 --> 00:09:25.625
but I don't typically like to give it those

00:09:25.625 --> 00:09:25.985
because,

00:09:27.105 --> 00:09:28.505
it just isn't really necessary,

00:09:28.505 --> 00:09:29.385
depending on your use case.

00:09:29.385 --> 00:09:31.265
But so we're basically just going to be dumping it

00:09:31.265 --> 00:09:33.905
inside of a file called Evaluation id.

00:09:34.065 --> 00:09:34.465
Now

00:09:34.785 --> 00:09:36.065
where do we get this id?

00:09:36.225 --> 00:09:38.385
We got it from this step right here,

00:09:38.465 --> 00:09:40.705
which saved the information into the database.

00:09:41.025 --> 00:09:41.745
This query

00:09:42.235 --> 00:09:43.275
created a random id,

00:09:43.915 --> 00:09:44.395
saved,

00:09:44.635 --> 00:09:46.475
inserted that information into our table,

00:09:46.475 --> 00:09:48.355
and then return that ID that was randomly

00:09:48.355 --> 00:09:48.875
generated.

00:09:49.035 --> 00:09:51.075
So essentially what we're going to be able to do,

00:09:51.075 --> 00:09:52.955
because this ID and this ID are going to be the

00:09:52.955 --> 00:09:53.155
same,

00:09:53.155 --> 00:09:55.395
it's going to be very easy for us to have like a

00:09:55.395 --> 00:09:58.075
SQL query that gives us all of our IDs,

00:09:58.115 --> 00:09:58.995
for our evaluations.

00:09:58.995 --> 00:10:01.675
And then we can go fetch those specific evaluation

00:10:01.675 --> 00:10:04.155
like HTML files based upon

00:10:04.345 --> 00:10:07.055
based upon the information that is saved into R2.

00:10:07.055 --> 00:10:07.415
Now

00:10:07.925 --> 00:10:11.765
we could like further just say HTML here and then

00:10:11.765 --> 00:10:13.222
I'll call this like r2path

00:10:13.438 --> 00:10:14.318
HTML.

00:10:14.318 --> 00:10:16.238
And then we could basically say like

00:10:17.418 --> 00:10:17.658
body,

00:10:19.338 --> 00:10:20.298
body text.

00:10:20.298 --> 00:10:21.338
And then this could be

00:10:22.138 --> 00:10:22.537
body,

00:10:23.952 --> 00:10:25.432
text actually might do this.

00:10:25.432 --> 00:10:27.672
This is going to be a little bit easier for us to

00:10:27.672 --> 00:10:28.832
kind of parse and read through.

00:10:29.212 --> 00:10:30.652
and then all we have to do.

00:10:30.652 --> 00:10:32.172
And this is kind of like the craziness of

00:10:32.612 --> 00:10:33.852
R2 to save data.

00:10:33.852 --> 00:10:36.452
You just say await this EMV.

00:10:36.852 --> 00:10:39.532
Now we have bucket and we're going to put the

00:10:39.532 --> 00:10:39.812
information

00:10:40.292 --> 00:10:42.132
at our R2 path,

00:10:42.462 --> 00:10:43.392
HTML path.

00:10:43.392 --> 00:10:45.272
So this is the path that is going to live at.

00:10:45.352 --> 00:10:47.991
And then we're going to say our collected data

00:10:47.991 --> 00:10:48.392
here

00:10:48.792 --> 00:10:50.672
is going to be the HTML.

00:10:50.672 --> 00:10:52.552
So this is just uploading that string

00:10:52.632 --> 00:10:53.512
representation

00:10:53.892 --> 00:10:55.572
of that HTML file.

00:10:55.892 --> 00:10:57.492
And then we're going to do a similar thing here,

00:10:57.492 --> 00:10:57.812
this

00:10:58.452 --> 00:10:59.012
bucket

00:10:59.522 --> 00:11:00.082
dot put.

00:11:00.322 --> 00:11:02.642
And then what we can do is we can say R2

00:11:03.362 --> 00:11:04.162
body text.

00:11:04.206 --> 00:11:07.038
And then we're going to be passing in the collect

00:11:07.038 --> 00:11:08.838
data dot body text.

00:11:09.718 --> 00:11:11.638
Now we're going to go ahead and deploy this again.

00:11:14.518 --> 00:11:17.838
And while this is deploying I am going to head

00:11:17.838 --> 00:11:19.318
back over to our

00:11:19.958 --> 00:11:20.807
workflows.

00:11:20.807 --> 00:11:20.985
So

00:11:21.175 --> 00:11:22.135
I'll do it in here.

00:11:22.135 --> 00:11:22.413
So

00:11:22.413 --> 00:11:23.468
go to workflows.

00:11:23.468 --> 00:11:25.457
I'm going to open up this specific workflow

00:11:26.097 --> 00:11:29.017
and I'm just going to copy the input that was the

00:11:29.017 --> 00:11:30.149
parameters that were passed in.

00:11:30.149 --> 00:11:31.445
It looks like this deployed.

00:11:32.045 --> 00:11:33.565
we can now see that

00:11:33.885 --> 00:11:36.605
we should be able to see that it has access to

00:11:36.925 --> 00:11:37.605
our bucket.

00:11:37.605 --> 00:11:37.845
Yep,

00:11:37.845 --> 00:11:39.165
it has access to a bucket here.

00:11:40.365 --> 00:11:41.805
And I'm going to trigger a new one,

00:11:41.965 --> 00:11:42.924
a new workflow

00:11:42.924 --> 00:11:44.332
and it's going to trigger that instance.

00:11:44.412 --> 00:11:47.372
Now this is going to run and we should see this

00:11:47.372 --> 00:11:48.852
information flow into our database.

00:11:48.852 --> 00:11:50.712
So when this is done we should see a

00:11:50.932 --> 00:11:52.673
second entry into this table

00:11:52.673 --> 00:11:55.642
and we should also see a file be populated inside

00:11:55.642 --> 00:11:56.322
of our

00:11:56.572 --> 00:11:58.172
R2 object storage bucket.

00:11:58.172 --> 00:11:59.292
Smart links eval.

00:11:59.452 --> 00:11:59.684
So

00:11:59.684 --> 00:12:01.688
let's just give this a second to finish running

00:12:01.688 --> 00:12:02.778
and then we will

00:12:02.868 --> 00:12:06.486
check back the database and the R2UM storage.

00:12:06.486 --> 00:12:06.772
All right,

00:12:06.772 --> 00:12:07.692
so this completed.

00:12:07.822 --> 00:12:10.152
so we can see that our AI basically said the

00:12:10.152 --> 00:12:11.152
status is unknown.

00:12:11.942 --> 00:12:12.182
We

00:12:12.502 --> 00:12:14.982
should have a second record inside of our table

00:12:14.982 --> 00:12:15.222
here.

00:12:15.222 --> 00:12:15.582
Yep.

00:12:15.582 --> 00:12:16.902
So we have a second record into here.

00:12:17.062 --> 00:12:18.742
Now if we head over to our

00:12:19.402 --> 00:12:20.442
R2 bucket,

00:12:20.602 --> 00:12:22.962
we'll refresh this and we should see now we have

00:12:22.962 --> 00:12:24.962
evaluations inside evaluations.

00:12:24.962 --> 00:12:26.151
We have this test account ID

00:12:26.151 --> 00:12:27.849
and then we have a,

00:12:28.469 --> 00:12:29.149
HTML.

00:12:29.149 --> 00:12:30.364
So this is the raw HTML.

00:12:30.500 --> 00:12:32.100
And then we also have,

00:12:32.100 --> 00:12:33.060
if we go back,

00:12:33.777 --> 00:12:35.497
we should go over to the body.

00:12:35.497 --> 00:12:36.937
I just want to look at the body text.

00:12:36.937 --> 00:12:38.977
So this will be the body text file.

00:12:39.697 --> 00:12:41.697
And I'm going to go ahead and download that.

00:12:41.706 --> 00:12:43.816
We can open that text file and now what we can

00:12:43.816 --> 00:12:44.096
see.

00:12:44.096 --> 00:12:46.296
So this is the information that's being extracted.

00:12:46.296 --> 00:12:49.216
So it actually does look like the browser

00:12:49.216 --> 00:12:51.936
rendering isn't pulling the entire information

00:12:52.176 --> 00:12:52.576
from,

00:12:53.096 --> 00:12:54.016
from AliExpress.

00:12:54.016 --> 00:12:56.176
And what I think's happening is I think AliExpress

00:12:56.176 --> 00:12:58.076
is like recognizing that this is a bottom

00:12:58.466 --> 00:12:59.746
and they're just limiting that information.

00:13:00.626 --> 00:13:02.626
so it's just not useful for us.

00:13:02.626 --> 00:13:02.986
So like,

00:13:02.986 --> 00:13:04.506
this is going to be kind of an issue with browser

00:13:04.506 --> 00:13:05.306
rendering just because,

00:13:05.306 --> 00:13:05.666
like,

00:13:05.906 --> 00:13:06.466
you know,

00:13:06.626 --> 00:13:08.666
websites don't want a whole bunch of bots scraping

00:13:08.666 --> 00:13:08.946
them.

00:13:08.976 --> 00:13:10.846
it's going to kind of be like a constant fight of

00:13:10.846 --> 00:13:13.806
trying to figure out how to best like scrape

00:13:13.806 --> 00:13:16.166
websites and detect if you're being blocked or

00:13:16.166 --> 00:13:16.406
not.

00:13:16.406 --> 00:13:17.766
And there might have been stuff in like the

00:13:17.766 --> 00:13:18.606
response from,

00:13:18.766 --> 00:13:20.926
from AliExpress indicating that,

00:13:21.166 --> 00:13:21.606
you know,

00:13:21.606 --> 00:13:22.326
we're being blocked.

00:13:22.326 --> 00:13:23.926
But what this has done is it's just basically

00:13:23.926 --> 00:13:24.286
said,

00:13:24.446 --> 00:13:24.806
you know,

00:13:24.806 --> 00:13:26.046
we don't have all that information.

00:13:26.046 --> 00:13:27.326
And just to double check,

00:13:27.726 --> 00:13:28.606
let's head over

00:13:29.066 --> 00:13:29.136
to,

00:13:29.230 --> 00:13:30.482
let's head over to the HTML

00:13:30.482 --> 00:13:32.251
and I'm just going to download this guy as well.

00:13:33.218 --> 00:13:33.658
Yeah,

00:13:33.658 --> 00:13:34.578
so this is actually,

00:13:34.578 --> 00:13:36.538
this has a lot of information in here.

00:13:36.538 --> 00:13:37.538
I wonder if,

00:13:37.583 --> 00:13:39.019
I wonder if we have.

00:13:39.179 --> 00:13:41.899
So we should see some text like this.

00:13:41.899 --> 00:13:43.886
I would expect that text to be into here.

00:13:46.086 --> 00:13:46.326
Yeah,

00:13:46.326 --> 00:13:47.366
it looks like it's not in there.

00:13:47.366 --> 00:13:47.966
So I do think,

00:13:47.966 --> 00:13:49.646
like if we were to render this page,

00:13:49.646 --> 00:13:50.006
which

00:13:50.406 --> 00:13:51.846
probably can actually do.

00:13:51.926 --> 00:13:53.926
So I'm just going to create like a test file,

00:13:54.566 --> 00:13:56.566
t.HTML,

00:13:56.966 --> 00:13:57.898
put that in there.

00:13:58.304 --> 00:13:58.944
and then

00:13:59.584 --> 00:14:00.809
I'm going to copy the path,

00:14:00.809 --> 00:14:01.887
head over to the browser.

00:14:02.084 --> 00:14:03.444
that's not rendering as I expected,

00:14:03.684 --> 00:14:05.484
but it does look like it's not pulling all that

00:14:05.484 --> 00:14:05.764
information.

00:14:05.764 --> 00:14:07.564
And so we might be able to tweak the browser

00:14:07.564 --> 00:14:08.204
rendering a little bit.

00:14:08.204 --> 00:14:08.644
And I would,

00:14:08.644 --> 00:14:10.524
I would like encourage you to go into Puppeteer

00:14:10.524 --> 00:14:11.364
and see all the features.

00:14:11.364 --> 00:14:12.964
Maybe there's something else that we can wait for

00:14:12.964 --> 00:14:15.364
to like ensure all of the text document has

00:14:15.364 --> 00:14:16.164
rendered as well.

00:14:16.484 --> 00:14:16.883
But,

00:14:17.204 --> 00:14:18.404
just to kind of recap here,

00:14:18.963 --> 00:14:21.255
we have this workflow with multiple steps.

00:14:22.015 --> 00:14:24.415
we're scraping data from browser rendering.

00:14:24.415 --> 00:14:27.015
We're evaluating the content of a web page through

00:14:27.015 --> 00:14:27.495
AI,

00:14:27.575 --> 00:14:29.775
we are saving some information into our database

00:14:29.775 --> 00:14:31.715
and then finally we are sending this information

00:14:31.795 --> 00:14:32.835
into R2.

00:14:32.995 --> 00:14:33.395
So,

00:14:33.935 --> 00:14:36.735
we've kind of gone through like an entire workflow

00:14:36.735 --> 00:14:37.935
with multiple steps.

00:14:37.935 --> 00:14:40.175
And we have gone through this process of,

00:14:40.855 --> 00:14:41.215
actually,

00:14:41.935 --> 00:14:42.455
you know,

00:14:42.455 --> 00:14:43.015
being able to,

00:14:43.015 --> 00:14:43.175
like,

00:14:43.175 --> 00:14:45.255
run these manually inside of the cloudflare ui and

00:14:45.255 --> 00:14:47.575
you can evaluate each step here and you can kind

00:14:47.575 --> 00:14:48.495
of monitor that way.

00:14:48.495 --> 00:14:48.815
But

00:14:49.215 --> 00:14:51.735
that isn't totally useful for us just because

00:14:51.735 --> 00:14:52.375
you're not going to,

00:14:52.375 --> 00:14:52.575
like,

00:14:52.575 --> 00:14:52.935
you know,

00:14:52.935 --> 00:14:54.655
build a product where you're manually running

00:14:54.655 --> 00:14:55.855
these things inside of the ui.

00:14:55.855 --> 00:14:57.935
You're going to want to programmatically run these

00:14:57.935 --> 00:14:58.895
evaluations.

00:14:58.975 --> 00:14:59.375
So,

00:14:59.815 --> 00:15:01.215
what we're going to be doing is we're going to

00:15:01.215 --> 00:15:03.855
basically be using durable objects to schedule out

00:15:03.855 --> 00:15:05.175
these workflows to run,

00:15:05.415 --> 00:15:07.375
and then from there we can determine what type of

00:15:07.375 --> 00:15:09.255
business logic we want to say.

00:15:09.255 --> 00:15:09.495
Like,

00:15:09.495 --> 00:15:11.255
when something happens on our platform,

00:15:11.655 --> 00:15:12.055
what

00:15:12.375 --> 00:15:14.575
encourages or what basically dictates the running

00:15:14.575 --> 00:15:15.255
of these workflows?

00:15:15.255 --> 00:15:15.455
You know,

00:15:15.455 --> 00:15:17.135
maybe the user is going to be a paid user,

00:15:17.135 --> 00:15:17.975
then this will run.

00:15:18.295 --> 00:15:19.615
Maybe it runs for every link,

00:15:19.615 --> 00:15:20.535
which we probably wouldn't want.

00:15:20.535 --> 00:15:21.295
Every link click,

00:15:21.295 --> 00:15:22.575
which we wouldn't want to do because that'd be

00:15:22.575 --> 00:15:23.015
really expensive.

00:15:23.015 --> 00:15:23.695
So maybe we'd say,

00:15:23.695 --> 00:15:23.935
like,

00:15:23.935 --> 00:15:25.095
if a link is clicked,

00:15:25.775 --> 00:15:26.735
we will run

00:15:27.455 --> 00:15:30.015
once every week or once every day or once every

00:15:30.015 --> 00:15:30.215
month.

00:15:30.215 --> 00:15:30.535
You know,

00:15:30.535 --> 00:15:30.735
like,

00:15:30.735 --> 00:15:31.255
that kind of,

00:15:31.255 --> 00:15:31.415
like,

00:15:31.415 --> 00:15:33.455
logic can be programmed out inside of a durable

00:15:33.455 --> 00:15:33.895
object.

00:15:33.895 --> 00:15:35.375
So that's kind of going to be the next section of

00:15:35.375 --> 00:15:35.855
this course.

