export const handleLikeToggle = async () => {
  const response = await fetch(`/posts/${post.id}/like`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userHasLiked: isLiked }), // Gửi trạng thái like
  });

  if (response.ok) {
    const updatedPost = await response.json();
    setLikesCount(updatedPost.likes); // Cập nhật số lượt like
    setIsLiked(!isLiked); // Chuyển đổi trạng thái like
  }
};
