export default function PostItem({ post }) {
  return (
    <div className="post">
      <p><strong>@{post.author}</strong></p>
      <p>{post.text}</p>
    </div>
  );
}