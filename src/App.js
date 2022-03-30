import axios from "axios";
import { useState } from "react";
import moment from "moment";

const SearchResultItem = ({ snippet, viewCount, videoId }) => {
  console.log(videoId, snippet);
  return (
    <div className="flex border-2 rounded-md">
      <a href={`https://www.youtube.com/watch?v=${videoId}`} target="_blank">
        <img
          src={snippet.thumbnails.medium.url}
          alt={snippet.title}
          style={{ width: snippet.thumbnails.medium.width }}
        />
      </a>

      <div className="flex flex-col px-4 my-2 w-[70rem]">
        <h3 className="text-xl">{snippet.title}</h3>
        <div className="text-gray-300 mt-2">
          view count: {viewCount}．{moment(snippet.publishTime).fromNow()}
        </div>
        <div className="italic text-gray-500 mt-2">{snippet.channelTitle}</div>
        <div className="text-sm mt-2">{snippet.description}</div>
      </div>
    </div>
  );
};
const App = () => {
  const [searchInput, setSearchInput] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [viewCount, setViewCount] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const searchURL = `https://youtube.googleapis.com/youtube/v3/search?part=id%2C%20snippet&maxResults=4&order=viewCount&q=${searchInput.trim()}&key=${
      process.env.REACT_APP_GOOGLE_API_KEY
    }`;

    const fetchSnippetResult = await axios.get(searchURL);
    if (fetchSnippetResult.data) {
      const { items } = fetchSnippetResult.data;
      setSearchResult([...items]);

      console.log("fetchSnippetResult", fetchSnippetResult.data);
      //get video id from data
      let videoIds = [];
      items.forEach((item) => {
        videoIds.push(item.id.videoId);
      });

      //construct list of ids for fetchVideoURL
      let urlString = "";
      videoIds.forEach((v) => {
        urlString += `id=${v}&`;
      });
      //search video stats base on 4 id from searchResult
      const fetchVideoURL = `https://youtube.googleapis.com/youtube/v3/videos?part=statistics&${urlString}key=${process.env.REACT_APP_GOOGLE_API_KEY}`;

      //fetch video count for list videos
      const fetchVideoStatResult = await axios.get(fetchVideoURL);

      console.log(fetchVideoStatResult.data);
      if (fetchVideoStatResult.data) {
        let viewCountObj = {};
        fetchVideoStatResult.data.items.forEach((item) => {
          viewCountObj[item.id] = item.statistics.viewCount;
        });

        setViewCount({ ...viewCountObj });
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="container mx-auto px-48">
      <h1 className="text-3xl font-bold mt-5">Youtube Seach API</h1>
      <form className="mt-4 flex" onSubmit={handleSubmit}>
        <div className="flex rounded-md shadow-sm flex-grow mr-3">
          <button
            type="button"
            onClick={() => setSearchInput("")}
            className="w-8 h-8 absolute right-[24.8rem] top-[5rem] text-gray-300 pointer-events-auto">
            X
          </button>
          <input
            type="text"
            name="company-website"
            id="company-website"
            className="focus:ring-indigo-500 focus:border-indigo-500 flex-1 block w-full rounded-md sm:text-sm border-gray-300 h-12 border-2 p-3"
            placeholder="search for desired videos"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
        <button
          type="button"
          className="rounded-md bg-blue-600 text-white px-3 py-1 h-12 disabled:cursor-not-allowed disabled:bg-blue-400 hover:bg-blue-800"
          disabled={!searchInput}
          onClick={handleSubmit}>
          Search
        </button>
      </form>

      <section className="mt-4">
        {isLoading && <div className="text-xl">Loading...</div>}
        {searchResult && viewCount && (
          <>
            {searchResult.map((data) => {
              return (
                <SearchResultItem
                  snippet={data.snippet}
                  videoId={data.id.videoId}
                  key={data.id.videoId}
                  viewCount={viewCount[data.id.videoId]}
                />
              );
            })}
          </>
        )}
      </section>
    </div>
  );
};

export default App;
