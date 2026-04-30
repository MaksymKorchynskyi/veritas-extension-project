from duckduckgo_search import DDGS
results = DDGS().text('Ukraine', max_results=1)
for r in results:
    print(r.keys())