(function () {
      document.querySelectorAll('a[href*="subject"]').forEach((link) => {
            addWatchedBtn(link);
          }
      );

      const targetNode = document.querySelector('body');
      const config = {
        childList: true,
        subtree: true
      };
      const callback = function (mutationsList, observer) {
        for (let mutation of mutationsList) {
          for (let node of mutation.addedNodes) {
            if (node.tagName === 'A') {
              addWatchedBtn(node)
            } else {
              node.nodeType === 1 && node.querySelectorAll('a[href*="subject"]').forEach((link) => {
                    addWatchedBtn(link);
                  }
              )
            }
          }
        }
      };

      // 创建一个观察器实例并传入回调函数
      const observer = new MutationObserver(callback);
      // 以上述配置开始观察目标节点
      observer.observe(targetNode, config);

      function getCookie(cookieName) {
        let strCookie = document.cookie;
        let arrCookie = strCookie.split("; ");
        for(let i = 0; i < arrCookie.length; i++){
          let arr = arrCookie[i].split("=");
          if(cookieName === arr[0]){
            return arr[1];
          }
        }
        return "";
      }

      function watch(event) {
        event.preventDefault();
        document.body.style.transition = '';
        let span = event.target;
        let subject = span.dataset["subject"];
        let ck = getCookie("ck");
        fetch(`https://movie.douban.com/j/subject/${subject}/interest`, {
          method: 'POST',
          mode: 'cors',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          credentials: 'include',
          body: `ck=${ck}&interest=collect&rating=&foldcollect=F&tags=&comment=&share-shuo=douban`,
        }).then(response => response.json()).then(res => {
              if (res.r === 0) {
                document.body.style.backgroundColor = '#21b879';
                document.body.clientWidth;
                document.body.style.transition = 'all 0.6s ease-in';
                document.body.style.backgroundColor = '';
                span.innerText = '已看';
                span.classList.remove('ext-unwatched');
                span.classList.add('ext-watched');
                span.removeEventListener('click', watch);
              } else {
                throw new Error();
              }
            }
        ).catch(error => {
              document.body.style.backgroundColor = '#f44336';
              document.body.clientWidth;
              document.body.style.transition = 'all 0.6s ease-in';
              document.body.style.backgroundColor = '';
            }
        );
      }

      function createTag(text, subject, isWatched) {
        let span = document.createElement('span');
        span.innerText = text;
        span.dataset["subject"] = subject;
        span.classList.add('ext-watch');
        if (isWatched) {
          span.classList.add('ext-watched');
        } else {
          span.classList.add('ext-unwatched');
          span.addEventListener('click', watch);
        }
        return span;
      }

      function addWatchedBtn(link) {
        let group = /subject\/(\d+)\//.exec(link.href || '');
        let img = link.querySelector('img');
        if (!group) {
          return;
        }

        if (!group[1]) {
          return;
        }

        if (!img) {
          return;
        }

        let subject = group[1];
        fetch(`https://movie.douban.com/j/subject_abstract?subject_id=${subject}`, {
          method: 'get',
          mode: 'no-cors',
          credentials: 'include'
        }).then(response => response.json()).then(res => {
              link.classList.add('ext-link');
              let text = '未看';
              let isWatched = false;
              if (res.subject) {
                let status = res.subject.collection_status;
                if (status === 'P') {
                  text = '已看';
                  isWatched = true;
                } else if (status === 'F') {
                  text = '想看';
                }
              }
              let span = createTag(text, subject, isWatched);
              img.parentNode.appendChild(span);
            }
        ).catch(error => {
          link.classList.add('ext-link');
          let span = createTag('未看', subject, false)
          img.parentNode.appendChild(span);
        })
      }

    }
)();
