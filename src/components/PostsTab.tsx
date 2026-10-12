import React, { useState, useRef } from 'react';
import { Image as ImageIcon, Send, Heart, Clock, X, Sparkles } from 'lucide-react';
import { PostItem, UserAccount } from '../types';

interface PostsTabProps {
  currentUser: string;
  cloudAccounts: Record<string, UserAccount>;
  posts: PostItem[];
  onPublishPost: (text: string, imgData: string) => void;
  onViewImage: (imgUrl: string) => void;
}

export const PostsTab: React.FC<PostsTabProps> = ({
  currentUser,
  cloudAccounts,
  posts,
  onPublishPost,
  onViewImage,
}) => {
  const [postText, setPostText] = useState('');
  const [postImg, setPostImg] = useState('');
  const [likes, setLikes] = useState<Record<string, number>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImagePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 300 * 1024) {
      alert('⚠️ حجم الصورة كبير! يرجى اختيار صورة أقل من 300KB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setPostImg(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handlePublish = () => {
    if (!postText.trim() && !postImg) {
      alert('⚠️ اكتب شيئاً أو أضف صورة لنشر المنشور.');
      return;
    }
    onPublishPost(postText.trim(), postImg);
    setPostText('');
    setPostImg('');
  };

  const toggleLike = (postId: string) => {
    setLikes((prev) => ({
      ...prev,
      [postId]: (prev[postId] || 0) + 1,
    }));
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Post Composer */}
      <div className="p-4 rounded-3xl bg-slate-900/80 border border-purple-500/20 shadow-xl space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-purple-200">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span>شارك لحظاتك مع نجوم التطبيق ✨</span>
        </div>

        <textarea
          rows={3}
          value={postText}
          onChange={(e) => setPostText(e.target.value)}
          placeholder="✍️ ماذا يدور في ذهنك اليوم؟..."
          className="w-full p-3 rounded-2xl bg-slate-950/70 border border-slate-800 text-white placeholder-slate-500 text-xs outline-none focus:border-purple-500 transition-colors resize-none"
        />

        {/* Selected image preview */}
        {postImg && (
          <div className="relative rounded-2xl overflow-hidden border border-purple-500/30 max-h-56">
            <img src={postImg} alt="Preview" className="w-full h-full object-cover" />
            <button
              onClick={() => setPostImg('')}
              className="absolute top-2 left-2 p-1.5 rounded-full bg-slate-950/80 text-white hover:bg-rose-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
          >
            <ImageIcon className="w-4 h-4 text-purple-400" />
            <span>إضافة صورة</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            onChange={handleImagePick}
            className="hidden"
          />

          <button
            type="button"
            onClick={handlePublish}
            className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:opacity-95 text-white text-xs font-bold shadow-lg shadow-purple-600/30 transition-all flex items-center justify-center gap-1.5 active:scale-98"
          >
            <Send className="w-4 h-4 rotate-180" />
            <span>نشر المنشور 🚀</span>
          </button>
        </div>
      </div>

      {/* Feed Stream */}
      <div className="space-y-3">
        <div className="text-xs font-bold text-purple-200/70 px-1">
          أحدث المنشورات ({posts.length})
        </div>

        {posts.length === 0 ? (
          <div className="p-8 rounded-3xl bg-slate-900/40 border border-slate-800 text-center text-slate-500 text-xs">
            لا توجد منشورات حتى الآن — كن أول من يشارك منشوره! ✨
          </div>
        ) : (
          posts.map((post) => {
            const author = cloudAccounts[post.from];
            const date = new Date(post.ts || Date.now());
            const timeStr = `${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
            const likeCount = likes[post.id] || 0;

            return (
              <div
                key={post.id}
                className="p-4 rounded-3xl bg-slate-900/70 border border-slate-800/80 shadow-md space-y-3"
              >
                {/* Author Info */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-800 border border-purple-500/20 shrink-0">
                    {author?.avatar ? (
                      <img src={author.avatar} alt={post.from} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-purple-700 flex items-center justify-center font-bold text-white">
                        {post.from.slice(0, 1).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{post.from}</h4>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>اليوم {timeStr}</span>
                    </span>
                  </div>
                </div>

                {/* Text */}
                {post.text && (
                  <p className="text-xs text-slate-200 leading-relaxed break-words whitespace-pre-wrap">
                    {post.text}
                  </p>
                )}

                {/* Image */}
                {post.img && (
                  <div className="rounded-2xl overflow-hidden border border-slate-800 max-h-72">
                    <img
                      src={post.img}
                      alt="Post visual"
                      onClick={() => onViewImage(post.img!)}
                      className="w-full h-full object-cover cursor-pointer hover:opacity-95 transition-opacity"
                    />
                  </div>
                )}

                {/* Interactions */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-xs text-slate-400">
                  <button
                    onClick={() => toggleLike(post.id)}
                    className="flex items-center gap-1.5 hover:text-pink-400 transition-colors"
                  >
                    <Heart className={`w-4 h-4 ${likeCount > 0 ? 'fill-pink-500 text-pink-500' : ''}`} />
                    <span>{likeCount > 0 ? `${likeCount} إعجاب` : 'إعجاب'}</span>
                  </button>
                  <span className="text-[11px] text-purple-300/60">منصة النجوم 🌟</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
