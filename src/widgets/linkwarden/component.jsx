import React, { useState, useEffect, useMemo, useCallback } from "react";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { widget } = service;

  // Assign icons. Assign recent/collections/tags to query by id(s)
  const bookmarkTypes = useMemo(
    () => ({
      recent: { ids: widget.mode.includes("recent") ? ["0"] : [] }, // "0" Is a made-up number used to allow looping in processBookmarks()
      collection: {
        ids: widget.params?.collectionIds ? widget.params.collectionIds : [],
      },
      tag: { ids: widget.params?.tagIds ? widget.params.tagIds : [] },
    }),
    [widget],
  );

  // State to hold Stats
  const [stats, setStats] = useState({
    totalLinks: null,
    collections: { list: null, total: null },
    tags: { list: null, total: null },
  });

  // State to hold Recent/Collection/Tag Bookmarks
  const [bookmarks, setBookmarks] = useState({
    recent: { icon: "📚️", data: {} },
    collection: { icon: "📁", data: {} },
    tag: { icon: "🏷️", data: {} },
  });

  const [fetchingMore, setFetchingMore] = useState({
    recent: {},
    collection: {},
    tag: {},
  });
  const [error, setError] = useState(null);

  const { data: collectionsStatsData, error: collectionsStatsError } = useWidgetAPI(widget, "collections"); // Fetch Collection Stats
  const { data: tagsStatsData, error: tagsStatsError } = useWidgetAPI(widget, "tags"); // Fetch Tag Stats

  // Effect to update Stats when collectionsStatsData or tagsStatsData changes
  useEffect(() => {
    if (collectionsStatsData?.response && tagsStatsData?.response) {
      /* eslint-disable no-underscore-dangle */
      setStats({
        totalLinks: collectionsStatsData.response.reduce((sum, collection) => sum + (collection._count?.links || 0), 0),
        collections: {
          list: collectionsStatsData.response,
          total: collectionsStatsData.response.length,
        },
        tags: {
          list: tagsStatsData.response,
          total: tagsStatsData.response.length,
        },
      });
      /* eslint-enable no-underscore-dangle */
    }
  }, [collectionsStatsData, tagsStatsData]);

  // Reusable function to fetch bookmarks based on ids.recent/ids.collection/ids.tag and type
  const fetchBookmarks = useCallback(async (ids, type, cursor, currentWidget) => {
    try {
      const promises = ids.map(async (id) => {
        const baseQuery = { sort: 0, cursor: cursor || "" };
        const query = type === "recent" ? baseQuery : { ...baseQuery, [`${type}Id`]: id };

        const queryParams = new URLSearchParams({
          group: currentWidget.service_group,
          service: currentWidget.service_name,
          endpoint: "links",
          query: JSON.stringify(query),
        });

        const response = await fetch(`/api/services/proxy?${queryParams}`);
        if (!response.ok) {
          if (response.status === 401) {
            setError("Unauthorized access. Please log in again.");
          } else {
            setError(`HTTP error! Status: ${response.status}`);
          }
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return { id, bookmarks: await response.json() };
      });

      return await Promise.all(promises);
    } catch (fetchError) {
      setError("An error occurred while fetching bookmarks.");
      return [];
    }
  }, []);

  const processBookmarks = useCallback(
    async (ids, type, cursor, currentWidget, currentStats, updateBookmarks, append = false) => {
      try {
        const fetchedBookmarks = await fetchBookmarks(ids, type, cursor, currentWidget);
        updateBookmarks((prev) => {
          const newBookmarks = fetchedBookmarks.map((item) => ({
            id: item.id,
            title:
              type === "recent"
                ? "Recent Bookmarks"
                : currentStats[`${type}s`]?.list?.find((statItem) => statItem.id.toString() === item.id)?.name ||
                  item.id,
            url: `${currentWidget.url}${type === "recent" ? "/links/" : `/${type}s/${item.id}/`}`,
            /* eslint-disable no-underscore-dangle */
            total:
              type === "recent"
                ? currentStats.totalLinks
                : currentStats[`${type}s`]?.list?.find((foundStatItem) => foundStatItem.id.toString() === item.id)
                    ?._count?.links || 0,
            /* eslint-enable no-underscore-dangle */
            cursor: item.bookmarks.response.length
              ? item.bookmarks.response[item.bookmarks.response.length - 1]?.id
              : "end",
            bookmarks: append
              ? [...(prev[type].data[item.id]?.bookmarks || []), ...item.bookmarks.response]
              : item.bookmarks.response,
          }));

          return {
            ...prev,
            [type]: {
              ...prev[type],
              data: {
                ...prev[type].data,
                ...Object.fromEntries(newBookmarks.map((bookmark) => [bookmark.id, bookmark])),
              },
            },
          };
        });
      } catch (processError) {
        const errorMessage = `Error setting ${type} bookmarks: ${processError.message}`;
        setError(errorMessage);
      }
    },
    [fetchBookmarks],
  );

  // Effect to fetch and update Recent/Collection/Tag Bookmarks
  useEffect(() => {
    if (error) return; // Stop fetching if there's an error

    const fetchAndProcessBookmarks = async () => {
      try {
        const bookmarkFetchPromises = Object.entries(bookmarkTypes)
          .filter(([type, { ids }]) => ids.length > 0 && Object.keys(bookmarks[type].data).length === 0)
          .map(async ([type, { ids }]) => {
            // Process bookmarks for each type
            await processBookmarks(ids, type, null, widget, stats, setBookmarks);
          });

        await Promise.all(bookmarkFetchPromises);
      } catch (fetchError) {
        setError(`Error processing bookmarks: ${fetchError.message}`);
      }
    };

    fetchAndProcessBookmarks();
  }, [bookmarkTypes, processBookmarks, widget, stats, bookmarks, error]);

  const handleScroll = async (event, id, type, cursor) => {
    const { scrollTop, scrollHeight, clientHeight } = event.target;
    if (scrollHeight - scrollTop <= clientHeight + 1 && cursor !== "end") {
      if (!fetchingMore[type][id]) {
        setFetchingMore((prev) => ({
          ...prev,
          [type]: { ...prev[type], [id]: true },
        }));
        try {
          await processBookmarks([id], type, cursor, widget, stats, setBookmarks, true);
        } finally {
          setFetchingMore((prev) => ({
            ...prev,
            [type]: { ...prev[type], [id]: false },
          }));
        }
      }
    }
  };

  // Handle errors
  if (error) {
    return <Container service={service} error={error} />;
  }
  if (collectionsStatsError || tagsStatsError) {
    return <Container service={service} error={collectionsStatsError || tagsStatsError} />;
  }

  // Render when data is available
  return (
    <>
      {widget.mode.includes("stats") && (
        <Container service={service}>
          <Block label="linkwarden.links" value={stats.totalLinks} />
          <Block label="linkwarden.collections" value={stats.collections.total} />
          <Block label="linkwarden.tags" value={stats.tags.total} />
        </Container>
      )}

      {Object.keys(bookmarks).map((type) => (
        <div
          key={type}
          className="service-container grid gap-2 p-1"
          style={{
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          }}
        >
          {Object.values(bookmarks[type].data).map((bookmarkList) => (
            <div key={bookmarkList.id} className="relative w-full text-left">
              <div className="flex text-sm mb-2">
                <a href={bookmarkList.url} target="_blank" rel="noopener noreferrer" className="grow font-bold">
                  {`${bookmarks[type].icon} ${bookmarkList.title}`}
                </a>
                <span>{`(${bookmarkList.total})`}</span>
              </div>
              <ul
                className="max-h-[17em] overflow-scroll flex flex-col gap-2"
                onScroll={(e) => handleScroll(e, bookmarkList.id, type, bookmarkList.cursor)}
              >
                {Object.values(bookmarkList.bookmarks).map(({ id, url, name, description }) => (
                  <li id={id} key={`${bookmarkList.title}-${type}-${id}`}>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-theme-200/50 dark:bg-theme-900/20 hover:bg-theme-200/75 hover:dark:bg-theme-900/50 flex-1 flex gap-2 rounded p-2 service-block"
                    >
                      <span className="w-8 min-w-8 flex items-center justify-center">🔗</span>
                      <div className="flex flex-col grow">
                        <div className="font-bold text-xs uppercase break-all overflow-hidden line-clamp-1 overflow-ellipsis">
                          {name || description}
                        </div>
                        <div className="font-thin text-xs break-all overflow-hidden line-clamp-1 overflow-ellipsis">
                          {url}
                        </div>
                      </div>
                    </a>
                  </li>
                ))}
                {fetchingMore[type][bookmarkList.id] && (
                  <li className="text-center">
                    <span className="text-sm">Loading more...</span>
                  </li>
                )}
              </ul>
            </div>
          ))}
        </div>
      ))}
    </>
  );
}
