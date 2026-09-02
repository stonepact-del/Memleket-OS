import type { State } from "../../../core/model";
import { date } from "../../format";
import { StoryArt } from "./StoryArt";
export function NewsArticle({ article, onBack }: { article: State["news"][number]; onBack: () => void }) { return <article className="news-article"><header><button aria-label="Gündeme dön" onClick={onBack}>‹</button><span>GÜNDEM / {article.category.toLocaleUpperCase("tr-TR")}</span></header><StoryArt article={article} hero /><div className="article-copy"><p>{article.category}</p><h1>{article.title}</h1><time dateTime={article.at}>{date(article.at, { dateStyle: "long", timeStyle: "short" })}</time><div className="article-rule" /><p className="article-body">{article.body}</p><small>Kurgusal MemleketOS gündemi</small></div></article>; }
