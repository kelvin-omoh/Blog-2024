import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  orderBy,
  where,
} from "firebase/firestore";
import { isEmpty } from "lodash";
import CommentBox from "../components/CommentBox";
import Like from "../components/Like";
import FeatureBlogs from "../components/FeatureBlogs";
import RelatedBlog from "../components/RelatedBlog";
import Tags from "../components/Tags";
import UserComments from "../components/UserComments";
import Spinner from "../components/Spinner";
import { db } from "../firebase";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const Detail = ({ setActive, user }) => {
  const userId = user?.uid;
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [blog, setBlog] = useState(null);
  const [blogs, setBlogs] = useState([]);
  const [tags, setTags] = useState([]);
  const [comments, setComments] = useState([]);
  const [likes, setLikes] = useState([]);
  const [userComment, setUserComment] = useState("");
  const [relatedBlogs, setRelatedBlogs] = useState([]);

  useEffect(() => {
    const fetchRecentBlogs = async () => {
      const blogRef = collection(db, "blogs");
      const recentBlogsQuery = query(blogRef, orderBy("timestamp", "desc"), limit(5));
      const docSnapshot = await getDocs(recentBlogsQuery);
      setBlogs(docSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };

    fetchRecentBlogs();
  }, []);

  useEffect(() => {
    if (id) {
      fetchBlogDetail();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchBlogDetail = async () => {
    setLoading(true);
    const docRef = doc(db, "blogs", id);
    const blogDetail = await getDoc(docRef);
    const blogData = blogDetail.data();

    if (blogData) {
      const blogRef = collection(db, "blogs");
      const allBlogsSnapshot = await getDocs(blogRef);
      const tagsArray = allBlogsSnapshot.docs.flatMap((doc) => doc.get("tags"));
      const uniqueTags = [...new Set(tagsArray)];

      const relatedBlogsQuery = query(
        blogRef,
        where("tags", "array-contains-any", blogData.tags),
        limit(3)
      );
      const relatedBlogSnapshot = await getDocs(relatedBlogsQuery);
      const relatedBlogsData = relatedBlogSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      setBlog(blogData);
      setTags(uniqueTags);
      setComments(blogData.comments || []);
      setLikes(blogData.likes || []);
      setRelatedBlogs(relatedBlogsData);
      setActive(null);
    }

    setLoading(false);
  };

  const handleComment = async (e) => {
    e.preventDefault();

    const newComment = {
      createdAt: Timestamp.fromDate(new Date()),
      userId,
      name: user?.displayName,
      body: userComment,
    };

    const updatedComments = [...comments, newComment];
    setComments(updatedComments);

    await updateDoc(doc(db, "blogs", id), {
      ...blog,
      comments: updatedComments,
      timestamp: serverTimestamp(),
    });

    toast.success("Comment posted successfully");
    setUserComment("");
  };

  const handleLike = async () => {
    if (userId) {
      const updatedLikes = blog?.likes ? [...blog.likes] : [];
      const userIndex = updatedLikes.findIndex((like) => like === userId);

      if (userIndex === -1) {
        updatedLikes.push(userId);
      } else {
        updatedLikes.splice(userIndex, 1);
      }

      setLikes(updatedLikes);

      await updateDoc(doc(db, "blogs", id), {
        ...blog,
        likes: updatedLikes,
        timestamp: serverTimestamp(),
      });
    }
  };

  if (loading) {
    return <Spinner />;
  }


  return (
    <div className="single">
      <div
        className="blog-title-box"
        style={{ backgroundImage: `url('${blog?.imgUrl}')` }}
      >
        <div className="overlay"></div>
        <div className="blog-title">
          <span>{blog?.timestamp.toDate().toDateString()}</span>
          <h2>{blog?.title}</h2>
        </div>
      </div>
      <div className="container-fluid pb-4 pt-4 padding blog-single-content">
        <div className="container padding">
          <div className="row mx-0">
            <div className="col-md-8">
              <span className="meta-info text-start">
                By <p className="author">{blog?.author}</p> -&nbsp;
                {blog?.timestamp.toDate().toDateString()}
                <Like handleLike={handleLike} likes={likes} userId={userId} />
              </span>
              <div
                className="preview"
              >
                <ReactQuill value={blog?.description} readOnly={true} theme="bubble" />
              </div>
              <div className="text-start">
                <Tags tags={blog?.tags} />
              </div>
              <br />
              <div className="custombox">
                <div className="scroll">
                  <h4 className="small-title">{comments?.length} Comment</h4>
                  {isEmpty(comments) ? (
                    <UserComments
                      msg={
                        "No Comment yet posted on this blog. Be the first to comment"
                      }
                    />
                  ) : (
                    <>
                      {comments?.map((comment) => (
                        <UserComments {...comment} />
                      ))}
                    </>
                  )}
                </div>
              </div>
              <CommentBox
                userId={userId}
                userComment={userComment}
                setUserComment={setUserComment}
                handleComment={handleComment}
              />
            </div>
            <div className="col-md-3">
              <div className="blog-heading text-start py-2 mb-4">Tags</div>
              <Tags tags={tags} />
              <FeatureBlogs title={"Recent Blogs"} blogs={blogs} />
            </div>
          </div>
          <RelatedBlog id={id} blogs={relatedBlogs} />
        </div>
      </div>
    </div>
  );
};

export default Detail;
