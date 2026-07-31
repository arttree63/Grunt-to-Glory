import { useMemo, useState } from 'react'
import './review.css'

type Priority = 'P0' | 'P1' | 'P2' | 'P3'
type ReviewStatus = 'open' | 'progress' | 'review' | 'done' | 'deferred'
type Owner = '未指派' | 'Claude' | 'Codex' | '設計'

interface ReviewComment {
  id: string
  author: Owner
  text: string
  createdAt: string
}

interface ReviewIssue {
  id: string
  priority: Priority
  title: string
  problem: string
  why: string
  solution: string[]
  expected: string
  files: string[]
  status: ReviewStatus
  owner: Owner
  comments: ReviewComment[]
}

const STORAGE_KEY = 'little-soldier-game-review-v1'
const PRIORITIES: Priority[] = ['P0', 'P1', 'P2', 'P3']
const OWNERS: Owner[] = ['未指派', 'Claude', 'Codex', '設計']
const STATUS: Array<{ id: ReviewStatus; label: string }> = [
  { id: 'open', label: '待處理' },
  { id: 'progress', label: '進行中' },
  { id: 'review', label: '待驗收' },
  { id: 'done', label: '已完成' },
  { id: 'deferred', label: '延後' },
]

const SEED_ISSUES: ReviewIssue[] = [
  {
    id: 'destiny-expectation',
    priority: 'P0',
    title: '命運系統沒有期待感',
    problem: '玩家一開始就知道所有命運，最後容易形成固定攻略。',
    why: '命運樹目前更像技能樹，而不是冒險途中發生的未知事件。',
    solution: ['10F 命運降臨，隨機獲得一項能力', '30F 命運抉擇，從三個方向選一個', '未獲得的命運不提前公開完整內容'],
    expected: '玩家會期待下一次降臨，每一輪形成不同 Build。',
    files: ['src/core/destiny.ts', 'src/core/game.ts', 'src/ui/DestinyCard.tsx', 'src/ui/panels/DestinyPanel.tsx'],
    status: 'review',
    owner: 'Codex',
    comments: [],
  },
  {
    id: 'gold-investment',
    priority: 'P0',
    title: '金幣只有單一用途',
    problem: '金幣只用來提高等級，玩家沒有投資選擇。',
    why: '單一路徑讓每次獲得金幣都只是數字變大，無法形成 Build 決策。',
    solution: ['保留共用等級作為主成長軸', 'Lv.10、20、30 等里程碑提供一次訓練方向', '不同訓練改變操作或資源循環，不只是百分比'],
    expected: '同樣是 Lv.40，也能因投資方向不同而形成不同玩法。',
    files: ['src/core/game.ts', 'src/core/balance.ts', 'src/ui/TrainingChoice.tsx', 'src/ui/panels/HeroPanel.tsx'],
    status: 'review',
    owner: 'Codex',
    comments: [],
  },
  {
    id: 'job-lock',
    priority: 'P1',
    title: '職業太早鎖死流派',
    problem: '職業一選定，後續玩法方向幾乎已經確定。',
    why: '後續系統多半只是在加深職業既有特色，缺少重新解讀的機會。',
    solution: ['命運先提出本輪條件', '職業負責詮釋命運，而不是決定唯一玩法', '重大命運抉擇再完成流派'],
    expected: '同一個職業可以連續玩很多輪，仍然產生不同 Build。',
    files: ['src/core/jobs.ts', 'src/core/destiny.ts', 'src/core/game.ts'],
    status: 'open',
    owner: '未指派',
    comments: [],
  },
  {
    id: 'merc-core',
    priority: 'P1',
    title: '傭兵不是 Build 核心',
    problem: '傭兵目前比較像額外收益或被動效果，選擇後很少改變玩家操作。',
    why: '傭兵沒有和技能順序、命運或敵人問題形成足夠強的互動。',
    solution: ['每位傭兵只保留一個明確招牌行為', '讓招牌行為能被特定 Build 放大', '敵人機制提供傭兵可以解答的問題'],
    expected: '玩家會因為本輪 Build 主動選擇傭兵，而不是只比較數值。',
    files: ['src/core/mercs.ts', 'src/core/game.ts', 'src/render/BattleScene.ts'],
    status: 'open',
    owner: '未指派',
    comments: [],
  },
  {
    id: 'enemy-question',
    priority: 'P1',
    title: '敵人沒有提出問題',
    problem: '多數敵人只是血量不同，玩家不需要改變打法。',
    why: '戰鬥缺少要求玩家調整技能時機、攻擊來源或資源分配的敵人行為。',
    solution: ['每個地帶只引入一種主要戰鬥問題', '一般敵人先教規則，Boss 再組合考題', '讓不同 Build 各有擅長與不擅長的解法'],
    expected: '玩家看到敵人就能判斷這場戰鬥要處理什麼，而不是只看血量。',
    files: ['src/core/enemies.ts', 'src/core/game.ts', 'src/render/BattleScene.ts'],
    status: 'open',
    owner: '未指派',
    comments: [],
  },
  {
    id: 'boss-dummy',
    priority: 'P2',
    title: 'Boss 太像木樁',
    problem: 'Boss 戰主要仍是限時輸出，缺少不同階段的節奏變化。',
    why: '雖然已有護盾、蓄力與圖騰，但資訊與演出還沒有形成清楚的戰鬥段落。',
    solution: ['入場先預告本場核心機制', '戰鬥中只突出目前最需要處理的一件事', '成功解題後給明確的易傷與反攻窗口'],
    expected: 'Boss 戰會有讀題、應對、反攻三個節奏，而不是持續輸出。',
    files: ['src/core/game.ts', 'src/ui/App.tsx', 'src/render/BattleScene.ts'],
    status: 'open',
    owner: '未指派',
    comments: [],
  },
]

function isPriority(value: unknown): value is Priority {
  return PRIORITIES.includes(value as Priority)
}

function isStatus(value: unknown): value is ReviewStatus {
  return STATUS.some((item) => item.id === value)
}

function isOwner(value: unknown): value is Owner {
  return OWNERS.includes(value as Owner)
}

function cleanText(value: unknown, max = 1000): string {
  return typeof value === 'string' ? value.slice(0, max) : ''
}

function loadIssues(): ReviewIssue[] {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null')
    if (!Array.isArray(raw)) return SEED_ISSUES
    const valid = raw.flatMap((item): ReviewIssue[] => {
      if (!item || typeof item !== 'object') return []
      const issue = item as Partial<ReviewIssue>
      if (!isPriority(issue.priority) || !isStatus(issue.status) || !isOwner(issue.owner)) return []
      const title = cleanText(issue.title, 120)
      if (!title) return []
      return [{
        id: cleanText(issue.id, 80) || crypto.randomUUID(),
        priority: issue.priority,
        title,
        problem: cleanText(issue.problem),
        why: cleanText(issue.why),
        solution: Array.isArray(issue.solution) ? issue.solution.map((line) => cleanText(line, 300)).filter(Boolean).slice(0, 8) : [],
        expected: cleanText(issue.expected),
        files: Array.isArray(issue.files) ? issue.files.map((file) => cleanText(file, 180)).filter(Boolean).slice(0, 12) : [],
        status: issue.status,
        owner: issue.owner,
        comments: Array.isArray(issue.comments)
          ? issue.comments.flatMap((comment): ReviewComment[] => {
              if (!comment || typeof comment !== 'object') return []
              const row = comment as Partial<ReviewComment>
              if (!isOwner(row.author)) return []
              const text = cleanText(row.text, 500)
              if (!text) return []
              return [{
                id: cleanText(row.id, 80) || crypto.randomUUID(),
                author: row.author,
                text,
                createdAt: cleanText(row.createdAt, 40),
              }]
            }).slice(-100)
          : [],
      }]
    })
    return valid.length > 0 ? valid : SEED_ISSUES
  } catch {
    return SEED_ISSUES
  }
}

function priorityMeaning(priority: Priority): string {
  return {
    P0: '核心循環不成立',
    P1: '主要系統深度不足',
    P2: '理解或體驗品質問題',
    P3: '細節打磨',
  }[priority]
}

export default function GameReview() {
  const [issues, setIssues] = useState<ReviewIssue[]>(loadIssues)
  const [priority, setPriority] = useState<Priority | 'all'>('all')
  const [status, setStatus] = useState<ReviewStatus | 'all'>('all')
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [comment, setComment] = useState('')
  const [commentAuthor, setCommentAuthor] = useState<Owner>('設計')
  const [creating, setCreating] = useState(false)
  const [draftTitle, setDraftTitle] = useState('')
  const [draftPriority, setDraftPriority] = useState<Priority>('P1')

  const save = (next: ReviewIssue[]) => {
    setIssues(next)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }

  const filtered = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase()
    return issues.filter((issue) => {
      if (priority !== 'all' && issue.priority !== priority) return false
      if (status !== 'all' && issue.status !== status) return false
      if (!needle) return true
      return [issue.title, issue.problem, issue.why, issue.expected, ...issue.solution, ...issue.files]
        .some((text) => text.toLocaleLowerCase().includes(needle))
    })
  }, [issues, priority, query, status])

  const selected = selectedId ? issues.find((issue) => issue.id === selectedId) ?? null : null
  const opened = issues.filter((issue) => issue.status !== 'done' && issue.status !== 'deferred').length
  const completed = issues.filter((issue) => issue.status === 'done').length
  const deferred = issues.filter((issue) => issue.status === 'deferred').length

  const patchIssue = (id: string, patch: Partial<ReviewIssue>) => {
    save(issues.map((issue) => issue.id === id ? { ...issue, ...patch } : issue))
  }

  const addComment = () => {
    const text = comment.trim().slice(0, 500)
    if (!selected || !text) return
    patchIssue(selected.id, {
      comments: [...selected.comments, {
        id: crypto.randomUUID(),
        author: commentAuthor,
        text,
        createdAt: new Date().toISOString(),
      }],
    })
    setComment('')
  }

  const addIssue = () => {
    const title = draftTitle.trim().slice(0, 120)
    if (!title) return
    const issue: ReviewIssue = {
      id: crypto.randomUUID(),
      priority: draftPriority,
      title,
      problem: '待補充',
      why: '待補充',
      solution: ['待補充'],
      expected: '待補充',
      files: [],
      status: 'open',
      owner: '未指派',
      comments: [],
    }
    save([issue, ...issues])
    setDraftTitle('')
    setCreating(false)
    setSelectedId(issue.id)
  }

  return (
    <main className="review-shell">
      <header className="review-header">
        <div>
          <a className="review-back" href="/">小兵的故事</a>
          <h1>Game Review</h1>
          <p>把設計討論變成可執行、可驗收、可關閉的 Issue。</p>
        </div>
        <div className="review-counts" aria-label="Review 統計">
          <span><b>+{opened}</b> 開啟</span>
          <span><b>{completed}</b> 完成</span>
          <span><b>−{deferred}</b> 延後</span>
        </div>
      </header>

      <section className="review-toolbar" aria-label="Review 篩選">
        <label className="review-search">
          <span>搜尋</span>
          <input value={query} onChange={(event) => setQuery(event.target.value.slice(0, 120))} placeholder="問題、模組或結果" />
        </label>
        <div className="review-filter">
          <button className={priority === 'all' ? 'active' : ''} onClick={() => setPriority('all')}>全部</button>
          {PRIORITIES.map((item) => (
            <button key={item} className={priority === item ? `active ${item.toLowerCase()}` : item.toLowerCase()} onClick={() => setPriority(item)}>
              {item}
            </button>
          ))}
        </div>
        <select aria-label="狀態篩選" value={status} onChange={(event) => setStatus(event.target.value as ReviewStatus | 'all')}>
          <option value="all">所有狀態</option>
          {STATUS.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
        </select>
        <button className="review-add" onClick={() => setCreating(true)}>新增 Review</button>
      </section>

      <section className="review-board">
        {PRIORITIES.map((level) => {
          const rows = filtered.filter((issue) => issue.priority === level)
          if (rows.length === 0) return null
          return (
            <section className={`review-lane ${level.toLowerCase()}`} key={level}>
              <div className="review-lane-title">
                <span>{level}</span>
                <div>
                  <b>{priorityMeaning(level)}</b>
                  <small>{rows.length} 張</small>
                </div>
              </div>
              <div className="review-list">
                {rows.map((issue) => (
                  <button
                    className={`review-card status-${issue.status}`}
                    key={issue.id}
                    onClick={() => setSelectedId(issue.id)}
                  >
                    <span className="review-card-priority">{issue.priority}</span>
                    <span className="review-card-main">
                      <b>{issue.title}</b>
                      <small>{STATUS.find((item) => item.id === issue.status)?.label}・{issue.owner}</small>
                    </span>
                    <span className="review-card-comments">{issue.comments.length} 留言</span>
                    <span className="review-card-arrow">›</span>
                  </button>
                ))}
              </div>
            </section>
          )
        })}
        {filtered.length === 0 && <div className="review-empty">沒有符合條件的 Review。</div>}
      </section>

      {creating && (
        <div className="review-modal" role="dialog" aria-modal="true" aria-labelledby="new-review-title" onPointerDown={() => setCreating(false)}>
          <form
            className="review-create"
            onPointerDown={(event) => event.stopPropagation()}
            onSubmit={(event) => {
              event.preventDefault()
              addIssue()
            }}
          >
            <h2 id="new-review-title">新增 Game Review</h2>
            <label>
              優先級
              <select value={draftPriority} onChange={(event) => setDraftPriority(event.target.value as Priority)}>
                {PRIORITIES.map((item) => <option key={item}>{item}</option>)}
              </select>
            </label>
            <label>
              一句話問題
              <input autoFocus value={draftTitle} maxLength={120} onChange={(event) => setDraftTitle(event.target.value)} placeholder="例如：命運系統沒有期待感" />
            </label>
            <div className="review-create-actions">
              <button type="button" onClick={() => setCreating(false)}>取消</button>
              <button className="primary" type="submit">建立 Review</button>
            </div>
          </form>
        </div>
      )}

      {selected && (
        <div className="review-modal" role="dialog" aria-modal="true" aria-labelledby="review-detail-title" onPointerDown={() => setSelectedId(null)}>
          <article className="review-detail" onPointerDown={(event) => event.stopPropagation()}>
            <header>
              <span className={`review-detail-priority ${selected.priority.toLowerCase()}`}>{selected.priority}</span>
              <div>
                <small>{priorityMeaning(selected.priority)}</small>
                <h2 id="review-detail-title">{selected.title}</h2>
              </div>
              <button className="review-close" aria-label="關閉 Review" onClick={() => setSelectedId(null)}>×</button>
            </header>

            <div className="review-controls">
              <label>
                狀態
                <select value={selected.status} onChange={(event) => patchIssue(selected.id, { status: event.target.value as ReviewStatus })}>
                  {STATUS.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
                </select>
              </label>
              <label>
                指派
                <select value={selected.owner} onChange={(event) => patchIssue(selected.id, { owner: event.target.value as Owner })}>
                  {OWNERS.map((item) => <option key={item}>{item}</option>)}
                </select>
              </label>
            </div>

            <section>
              <h3>問題 <span>Problem</span></h3>
              <p>{selected.problem}</p>
            </section>
            <section>
              <h3>原因 <span>Why</span></h3>
              <p>{selected.why}</p>
            </section>
            <section>
              <h3>修改方案 <span>Solution</span></h3>
              <ul>{selected.solution.map((line) => <li key={line}>{line}</li>)}</ul>
            </section>
            <section className="review-expected">
              <h3>玩家結果 <span>Expected Result</span></h3>
              <p>{selected.expected}</p>
            </section>
            <section>
              <h3>影響模組 <span>Files</span></h3>
              <div className="review-files">
                {selected.files.length > 0 ? selected.files.map((file) => <code key={file}>{file}</code>) : <span>尚未指定</span>}
              </div>
            </section>

            <section className="review-comments">
              <h3>討論 <span>{selected.comments.length}</span></h3>
              {selected.comments.length === 0 && <p className="review-no-comments">還沒有留言。</p>}
              {selected.comments.map((row) => (
                <div className="review-comment" key={row.id}>
                  <b>{row.author}</b>
                  <time dateTime={row.createdAt}>{row.createdAt ? new Date(row.createdAt).toLocaleString('zh-TW') : ''}</time>
                  <p>{row.text}</p>
                </div>
              ))}
              <div className="review-comment-box">
                <select aria-label="留言者" value={commentAuthor} onChange={(event) => setCommentAuthor(event.target.value as Owner)}>
                  {OWNERS.filter((item) => item !== '未指派').map((item) => <option key={item}>{item}</option>)}
                </select>
                <textarea value={comment} maxLength={500} onChange={(event) => setComment(event.target.value)} placeholder="留下設計判斷、驗收結果或執行問題" />
                <button disabled={!comment.trim()} onClick={addComment}>留言</button>
              </div>
            </section>
          </article>
        </div>
      )}
    </main>
  )
}
