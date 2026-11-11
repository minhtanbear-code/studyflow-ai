"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Award,
  Bot,
  Brain,
  Check,
  CheckCircle2,
  Clock,
  Flame,
  Info,
  Music,
  RotateCcw,
  Shield,
  Sparkles,
  Swords,
  Trophy,
  Volume2,
  VolumeX,
  X,
  Zap,
} from "lucide-react";
import { BotDifficulty, PKHistoryEntry } from "@/core/domain/pk.types";
import { getQuestionsBySubject, QuizQuestion } from "@/core/data/quizQuestions";
import { soundEffects } from "@/core/services/soundEffects.service";

interface PKBattleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRewardCoins: (amount: number) => void;
  isBotPractice?: boolean;
  botDifficulty?: BotDifficulty;
  practiceSubject?: string;
  onSaveHistory?: (entry: PKHistoryEntry) => void;
}

export function PKBattleModal({
  isOpen,
  onClose,
  onRewardCoins,
  isBotPractice = false,
  botDifficulty = "medium",
  practiceSubject = "Tiếng Anh chuyên ngành",
  onSaveHistory,
}: PKBattleModalProps) {
  const [battleState, setBattleState] = useState<"lobby" | "playing" | "result">("lobby");
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [userScore, setUserScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [userCorrectCount, setUserCorrectCount] = useState(0);
  const [userResponseTimes, setUserResponseTimes] = useState<number[]>([]);
  const [isMusicOn, setIsMusicOn] = useState(true);
  const questionStartTimeRef = useRef<number>(Date.now());

  // Bot realistic response state
  const [botStatus, setBotStatus] = useState<"thinking" | "answered">("thinking");
  const botTimerRef = useRef<NodeJS.Timeout | null>(null);

  const questions: QuizQuestion[] = useMemo(() => {
    return getQuestionsBySubject(practiceSubject, 5);
  }, [practiceSubject, isOpen]);

  // Reset when modal opens
  useEffect(() => {
    if (isOpen) {
      setBattleState("lobby");
      setCurrentQIndex(0);
      setUserScore(0);
      setOpponentScore(0);
      setTimeLeft(10);
      setSelectedOption(null);
      setUserCorrectCount(0);
      setUserResponseTimes([]);
      setBotStatus("thinking");
    }
  }, [isOpen]);

  // Main countdown timer with sound tick
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (battleState === "playing" && timeLeft > 0 && selectedOption === null) {
      if (timeLeft <= 3 && isMusicOn) {
        soundEffects.playTick();
      }
      timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (timeLeft === 0 && battleState === "playing" && selectedOption === null) {
      handleAnswer(-1); // Time out
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [battleState, timeLeft, selectedOption, isMusicOn]);

  // Clean up BGM on modal unmount
  useEffect(() => {
    return () => {
      soundEffects.stopBackgroundMusic();
    };
  }, []);

  // Simulated realistic bot answering behavior with delay & difficulty accuracy
  useEffect(() => {
    if (battleState !== "playing" || selectedOption !== null) return;

    setBotStatus("thinking");
    if (botTimerRef.current) clearTimeout(botTimerRef.current);

    // Calculate delay based on difficulty
    let delayMs = 4500;
    let accuracyChance = 0.7;

    if (botDifficulty === "easy") {
      delayMs = 5500 + Math.random() * 2000; // 5.5s - 7.5s (Slower)
      accuracyChance = 0.45; // ~45% correct
    } else if (botDifficulty === "medium") {
      delayMs = 3800 + Math.random() * 1500; // 3.8s - 5.3s
      accuracyChance = 0.72; // ~72% correct
    } else if (botDifficulty === "hard") {
      delayMs = 2200 + Math.random() * 1200; // 2.2s - 3.4s (Fast)
      accuracyChance = 0.92; // ~92% correct
    } else if (botDifficulty === "adaptive") {
      // Adaptive: adjust to student's current score
      if (userScore > opponentScore) {
        // Bot accelerates and sharpens accuracy
        delayMs = 2800 + Math.random() * 1000;
        accuracyChance = 0.85;
      } else {
        // Bot gives room for student
        delayMs = 4500 + Math.random() * 1500;
        accuracyChance = 0.58;
      }
    }

    botTimerRef.current = setTimeout(() => {
      setBotStatus("answered");
      const isBotCorrect = Math.random() < accuracyChance;
      if (isBotCorrect) {
        setOpponentScore((prev) => prev + 90);
      }
    }, delayMs);

    return () => {
      if (botTimerRef.current) clearTimeout(botTimerRef.current);
    };
  }, [battleState, currentQIndex, botDifficulty, userScore, opponentScore, selectedOption]);

  if (!isOpen) return null;

  const handleStartBattle = () => {
    setUserScore(0);
    setOpponentScore(0);
    setCurrentQIndex(0);
    setTimeLeft(10);
    setSelectedOption(null);
    setUserCorrectCount(0);
    setUserResponseTimes([]);
    questionStartTimeRef.current = Date.now();
    setBattleState("playing");
    if (isMusicOn) {
      soundEffects.startBackgroundMusic();
    }
  };

  const handleClose = () => {
    soundEffects.stopBackgroundMusic();
    onClose();
  };

  const handleAnswer = (optionIndex: number) => {
    setSelectedOption(optionIndex);
    const timeSpent = Math.max(1, 10 - timeLeft);
    setUserResponseTimes((prev) => [...prev, timeSpent]);

    const q = questions[currentQIndex];
    const isCorrect = optionIndex === q.correct;

    if (isCorrect) {
      setUserCorrectCount((prev) => prev + 1);
      setUserScore((prev) => prev + 100 + timeLeft * 5);
      if (isMusicOn) soundEffects.playCorrectSound();
    } else {
      if (isMusicOn) soundEffects.playWrongSound();
    }

    setTimeout(() => {
      if (currentQIndex + 1 < questions.length) {
        setCurrentQIndex((prev) => prev + 1);
        setSelectedOption(null);
        setTimeLeft(10);
        questionStartTimeRef.current = Date.now();
      } else {
        setBattleState("result");
        soundEffects.stopBackgroundMusic();
        if (isMusicOn) soundEffects.playVictoryFanfare();

        // Reward rules compliance
        if (!isBotPractice) {
          onRewardCoins(25);
        }

        // Save history entry
        if (onSaveHistory) {
          const isWin = userScore >= opponentScore;
          const newEntry: PKHistoryEntry = {
            id: "hist-" + Date.now(),
            roomCode: isBotPractice ? `BOT-${botDifficulty.toUpperCase().slice(0, 3)}` : "PK-PVP",
            subjectName: practiceSubject,
            mode: "solo",
            teamSize: "1v1",
            result: isWin ? "win" : "loss",
            score: `${userCorrectCount + (isCorrect ? 1 : 0)}/${questions.length}`,
            opponentOrTeam: isBotPractice ? `Bot (${botDifficulty.toUpperCase()})` : "Người chơi khác",
            ratingDelta: isBotPractice ? 0 : isWin ? 24 : -12, // Practice strictly gives 0 rating delta
            date: "Vừa xong",
            isBotPractice: isBotPractice,
            botDifficulty: botDifficulty,
            feedbackNotes: isBotPractice
              ? "Trận luyện tập với Bot: 0 XP, 0 Rating. Dùng để củng cố phản xạ kiến thức."
              : "Trận thi đấu chính thức Solo 1v1.",
          };
          onSaveHistory(newEntry);
        }
      }
    }, 1200);
  };

  // Bot display info
  const botInfo = {
    easy: { name: "Cú Bông Bot", label: "Easy (Dành cho người mới)", color: "text-emerald-700 bg-emerald-100" },
    medium: { name: "Cú Bông Bot", label: "Medium (Độ khó vừa)", color: "text-amber-700 bg-amber-100" },
    hard: { name: "Cú Bông Bot", label: "Hard (Thử thách cao)", color: "text-rose-700 bg-rose-100" },
    adaptive: { name: "Adaptive AI Bot", label: "Adaptive (Thích ứng thông minh)", color: "text-purple-700 bg-purple-100" },
  }[botDifficulty];

  const avgResponseTime =
    userResponseTimes.length > 0
      ? (userResponseTimes.reduce((a, b) => a + b, 0) / userResponseTimes.length).toFixed(1)
      : "3.5";

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border-4 border-blue-400">
        {/* Header */}
        <div
          className={`p-3.5 text-white flex items-center justify-between ${
            isBotPractice
              ? "bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600"
              : "bg-gradient-to-r from-orange-500 via-rose-500 to-amber-500"
          }`}
        >
          <div className="flex items-center gap-2 font-black text-sm">
            {isBotPractice ? <Bot className="w-5 h-5 text-yellow-300" /> : <Swords className="w-5 h-5 text-yellow-200" />}
            <span>
              {isBotPractice ? "Luyện tập với Bot (Practice Battle)" : "Đấu Trường Solo 1 vs 1"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Background Music Toggle */}
            <button
              type="button"
              onClick={() => {
                const next = !isMusicOn;
                setIsMusicOn(next);
                if (next) {
                  if (battleState === "playing") soundEffects.startBackgroundMusic();
                } else {
                  soundEffects.stopBackgroundMusic();
                }
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all border shadow-sm ${
                isMusicOn
                  ? "bg-white/25 hover:bg-white/35 text-white border-white/40 shadow-emerald-900/10"
                  : "bg-black/25 hover:bg-black/35 text-slate-300 border-white/10"
              }`}
              title={isMusicOn ? "Đang bật nhạc nền tập trung (Nhấp để tắt)" : "Đang tắt nhạc nền (Nhấp để bật)"}
            >
              {isMusicOn ? (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-emerald-300 animate-pulse" />
                  <span className="hidden sm:inline">Nhạc nền</span>
                  <span className="flex items-end gap-0.5 h-3">
                    <span className="w-0.5 h-1.5 bg-emerald-300 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                    <span className="w-0.5 h-3 bg-emerald-300 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                    <span className="w-0.5 h-2 bg-emerald-300 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                  </span>
                </>
              ) : (
                <>
                  <VolumeX className="w-3.5 h-3.5 text-slate-300" />
                  <span className="hidden sm:inline">Nhạc: Tắt</span>
                </>
              )}
            </button>

            {isBotPractice && (
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-white/20 text-white border border-white/20 hidden md:inline-block">
                {botInfo.label}
              </span>
            )}
            <button
              onClick={handleClose}
              className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 1. LOBBY VIEW                                            */}
        {/* ======================================================== */}
        {battleState === "lobby" && (
          <div className="p-6 text-center space-y-4">
            <div
              className={`w-16 h-16 mx-auto rounded-3xl flex items-center justify-center text-white shadow-lg ${
                isBotPractice
                  ? "bg-gradient-to-tr from-blue-600 to-purple-600 shadow-blue-200"
                  : "bg-gradient-to-tr from-amber-400 to-orange-500 shadow-orange-200"
              }`}
            >
              {isBotPractice ? <Bot className="w-8 h-8 animate-bounce" /> : <Swords className="w-8 h-8 animate-pulse" />}
            </div>

            <div>
              <h3 className="text-lg font-black text-slate-900">
                {isBotPractice ? "Bắt đầu Luyện tập với Bot" : "Sẵn sàng Thách Đấu PK 1v1?"}
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Môn luyện tập: <strong className="text-blue-700">{practiceSubject}</strong>. Gồm 3 câu hỏi trắc nghiệm rèn luyện phản xạ và tốc độ làm bài.
              </p>
            </div>

            {/* PRACTICE BATTLE REWARD RULES NOTICE */}
            {isBotPractice && (
              <div className="bg-blue-50/80 border border-blue-200 rounded-2xl p-3 text-left space-y-1.5 text-xs">
                <div className="flex items-center gap-1.5 font-black text-blue-900">
                  <Shield className="w-4 h-4 text-blue-600" />
                  <span>Quy tắc Phần thưởng Luyện tập (Practice Rules)</span>
                </div>
                <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-600">
                  <div className="flex items-center gap-1">
                    <span className="text-slate-400">•</span>
                    <span>Không nhận XP (0 XP)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-slate-400">•</span>
                    <span>Rating không đổi (±0)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-slate-400">•</span>
                    <span>Không ảnh hưởng BXH</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-slate-400">•</span>
                    <span>Có báo cáo & gợi ý ôn tập</span>
                  </div>
                </div>
              </div>
            )}

            {/* Players preview */}
            <div className="flex items-center justify-center gap-6 py-2">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-amber-300 mx-auto flex items-center justify-center font-black text-sm shadow">
                  ĐL
                </div>
                <span className="text-xs font-bold text-slate-800 mt-1 block">Đô La (Bạn)</span>
              </div>

              <div className="text-lg font-black text-rose-500 italic">VS</div>

              <div className="text-center">
                <div
                  className={`w-12 h-12 rounded-full mx-auto flex items-center justify-center font-black text-base shadow ${
                    isBotPractice ? "bg-purple-100 text-purple-700 border-2 border-purple-300" : "bg-blue-300"
                  }`}
                >
                  {isBotPractice ? "🤖" : "👤"}
                </div>
                <span className="text-xs font-bold text-slate-800 mt-1 block">
                  {isBotPractice ? botInfo.name : "Người chơi khác"}
                </span>
                {isBotPractice && (
                  <span className="text-[10px] text-purple-600 font-bold block">
                    Độ khó: {botDifficulty.toUpperCase()}
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={handleStartBattle}
              className={`w-full py-3 rounded-2xl text-white font-black text-sm shadow-md active:scale-95 transition-all ${
                isBotPractice
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  : "bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600"
              }`}
            >
              {isBotPractice ? "🤖 BẮT ĐẦU LUYỆN TẬP VỚI BOT" : "🔥 BẮT ĐẦU TRẬN ĐẤU (1-Click)"}
            </button>
          </div>
        )}

        {/* ======================================================== */}
        {/* 2. PLAYING VIEW                                          */}
        {/* ======================================================== */}
        {battleState === "playing" && (
          <div className="p-4 space-y-3.5">
            {/* Scoreboard */}
            <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200 flex items-center justify-between">
              <div className="text-left">
                <span className="text-[10px] text-slate-500 font-bold">ĐÔ LA (BẠN)</span>
                <div className="text-lg font-black text-blue-600">{userScore} pts</div>
              </div>

              <div className="flex flex-col items-center">
                <div className="flex items-center gap-1 font-mono font-black text-sm px-3 py-0.5 rounded-full bg-orange-100 text-orange-700">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{timeLeft}s</span>
                </div>
                <span className="text-[10px] text-slate-400 mt-0.5">
                  Câu {currentQIndex + 1}/{questions.length}
                </span>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-slate-500 font-bold uppercase">
                  {isBotPractice ? botInfo.name : "ĐỐI THỦ"}
                </span>
                <div className="text-lg font-black text-rose-600">{opponentScore} pts</div>
                {/* Bot realistic status indicator */}
                {isBotPractice && (
                  <span
                    className={`text-[9px] font-bold block ${
                      botStatus === "thinking" ? "text-amber-600 animate-pulse" : "text-emerald-600"
                    }`}
                  >
                    {botStatus === "thinking" ? "Bot đang đọc..." : "Bot đã trả lời ✓"}
                  </span>
                )}
              </div>
            </div>

            {/* Question */}
            <div className="bg-blue-50/70 border-2 border-blue-200 rounded-2xl p-4 text-center">
              <span className="text-[10px] font-black uppercase text-blue-600 bg-white px-2 py-0.5 rounded-md mb-2 inline-block">
                Chuyên đề: {questions[currentQIndex].topic}
              </span>
              <h4 className="text-sm font-black text-slate-900 leading-snug">
                {questions[currentQIndex].q}
              </h4>
            </div>

            {/* Options */}
            <div className="grid grid-cols-2 gap-2.5">
              {questions[currentQIndex].options.map((opt, idx) => {
                const isSelected = selectedOption === idx;
                const isCorrect = idx === questions[currentQIndex].correct;
                let btnStyle = "bg-white border-2 border-slate-200 hover:border-blue-400 text-slate-800";

                if (selectedOption !== null) {
                  if (isCorrect) {
                    btnStyle = "bg-emerald-500 border-2 border-emerald-600 text-white font-black shadow-md";
                  } else if (isSelected) {
                    btnStyle = "bg-rose-500 border-2 border-rose-600 text-white font-black";
                  }
                }

                return (
                  <button
                    key={idx}
                    disabled={selectedOption !== null}
                    onClick={() => handleAnswer(idx)}
                    className={`p-3 rounded-2xl text-xs font-bold transition-all text-center ${btnStyle}`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>

            {/* Explanation when answered */}
            {selectedOption !== null && questions[currentQIndex]?.explanation && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 text-left text-xs text-amber-900 animate-in fade-in space-y-1">
                <span className="font-bold flex items-center gap-1 text-amber-800">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Giải thích đáp án:</span>
                </span>
                <p className="text-[11px] leading-relaxed text-slate-700">
                  {questions[currentQIndex].explanation}
                </p>
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* 3. RESULT VIEW                                           */}
        {/* ======================================================== */}
        {battleState === "result" && (
          <div className="p-6 text-center space-y-4">
            <div
              className={`w-14 h-14 mx-auto rounded-3xl flex items-center justify-center shadow-lg ${
                isBotPractice ? "bg-purple-600 text-white" : "bg-amber-400 text-white"
              }`}
            >
              {isBotPractice ? <Brain className="w-7 h-7" /> : <Trophy className="w-7 h-7" />}
            </div>

            <div>
              <h3 className="text-xl font-black text-slate-900">
                {isBotPractice
                  ? "BÁO CÁO KẾT QUẢ LUYỆN TẬP BOT"
                  : userScore >= opponentScore
                  ? "🎉 BẠN ĐÃ CHIẾN THẮNG!"
                  : "Trận đấu ngang sức!"}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Điểm số: <strong className="text-blue-600 font-bold">{userScore}</strong> vs Bot:{" "}
                <strong className="text-rose-600 font-bold">{opponentScore}</strong>
              </p>
            </div>

            {/* PRACTICE REWARD COMPLIANCE DISPLAY */}
            {isBotPractice ? (
              <div className="space-y-3">
                {/* Product Rule Box: 0 XP, 0 Rating */}
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2 text-left">
                  <div className="flex items-center justify-between text-[11px] font-bold pb-1.5 border-b border-slate-200">
                    <span className="text-slate-500">Quy tắc thưởng Luyện tập:</span>
                    <span className="text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full font-black">
                      Độ khó: {botDifficulty.toUpperCase()}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-1.5 rounded-xl bg-white border border-slate-100">
                      <div className="text-[10px] text-slate-400">XP thưởng</div>
                      <div className="font-black text-slate-700">0 XP</div>
                    </div>
                    <div className="p-1.5 rounded-xl bg-white border border-slate-100">
                      <div className="text-[10px] text-slate-400">Rating biến động</div>
                      <div className="font-black text-slate-700">±0</div>
                    </div>
                    <div className="p-1.5 rounded-xl bg-white border border-slate-100">
                      <div className="text-[10px] text-slate-400">BXH tổng/môn</div>
                      <div className="font-black text-slate-700">Không đổi</div>
                    </div>
                  </div>
                </div>

                {/* Performance Analytics & AI Study Suggestions */}
                <div className="p-3 bg-blue-50/70 rounded-2xl border border-blue-200 text-left space-y-2 text-xs">
                  <div className="flex items-center gap-1.5 font-black text-blue-900">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>Gợi ý ôn tập từ AI Cú Bông:</span>
                  </div>

                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Bạn trả lời đúng <strong>{userCorrectCount}/{questions.length} câu</strong> với tốc độ trung bình <strong>{avgResponseTime} giây/câu</strong>.
                    {botDifficulty === "adaptive" && (
                      <span className="block mt-1 text-purple-700 font-bold">
                        • Adaptive Bot đã nhận diện: Bạn phản xạ tốt ở chủ đề Antonyms, nên tăng cường luyện Mental Arithmetic.
                      </span>
                    )}
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 font-bold flex items-center justify-center gap-1.5">
                <span>Thưởng PvP:</span>
                <span className="text-amber-600 font-black">+25 Xu 🪙</span>
                <span>&</span>
                <span className="text-blue-600 font-black">+1 Trận PK hoàn thành</span>
              </div>
            )}

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={handleStartBattle}
                className="flex-1 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Luyện tập lại</span>
              </button>

              <button
                onClick={handleClose}
                className="flex-1 py-2.5 rounded-2xl bg-blue-600 text-white font-black text-xs shadow-md hover:bg-blue-700 transition-all"
              >
                Hoàn tất & Trở về
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
