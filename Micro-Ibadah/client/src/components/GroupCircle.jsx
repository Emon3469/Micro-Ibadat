import React, { useState, useEffect, useCallback } from "react";
import { Users, UserPlus, Copy, Trophy, Sparkles } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { createGroup, joinGroup, fetchGroupDetails, fetchUserGroups } from "../services/api";

export default function GroupCircle({ currentUser, onGroupJoined }) {
  const [groups, setGroups] = useState([]);
  const [activeGroup, setActiveGroup] = useState(null);
  const [activeGroupDetails, setActiveGroupDetails] = useState(null);
  const currentUserId = currentUser?._id || currentUser?.id;
  
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [loading, setLoading] = useState(false);

  // Load existing groups
  const loadGroups = useCallback(async () => {
    try {
      const uGroups = await fetchUserGroups(currentUserId);
      setGroups(uGroups || []);
      if (uGroups && uGroups.length > 0 && !activeGroup) {
        setActiveGroup(uGroups[0]);
      }
    } catch {
      console.error("Failed to load groups");
    }
  }, [activeGroup, currentUserId]);

  useEffect(() => {
    if (currentUserId) {
      loadGroups();
    }
  }, [currentUserId, loadGroups]);

  // Load specific group details when active group changes
  useEffect(() => {
    if (activeGroup) {
      loadGroupDetails(activeGroup._id);
    }
  }, [activeGroup]);

  const loadGroupDetails = async (groupId) => {
    try {
      const details = await fetchGroupDetails(groupId);
      setActiveGroupDetails(details);
    } catch {
      console.error("Failed to load group details");
    }
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) return;
    if (!currentUserId) return;
    setLoading(true);
    try {
      const newGroup = await createGroup(currentUserId, groupName);
      setGroups([...groups, newGroup]);
      setActiveGroup(newGroup);
      setIsCreating(false);
      setGroupName("");
      if (onGroupJoined) onGroupJoined();
    } catch {
      alert("Failed to create group");
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGroup = async () => {
    if (!inviteCode.trim()) return;
    if (!currentUserId) return;
    setLoading(true);
    try {
      const newGroup = await joinGroup(currentUserId, inviteCode);
      // Check if already in list
      if (!groups.find(g => g._id === newGroup._id)) {
        setGroups([...groups, newGroup]);
      }
      setActiveGroup(newGroup);
      setIsJoining(false);
      setInviteCode("");
      if (onGroupJoined) onGroupJoined();
    } catch {
      alert("Invalid invite code or already joined");
    } finally {
      setLoading(false);
    }
  };

  const copyInviteCode = () => {
    navigator.clipboard.writeText(activeGroup.inviteCode);
    alert(`Copied Invite Code: ${activeGroup.inviteCode}`);
  };

  const sortedMembers = activeGroupDetails?.members?.sort((a, b) => {
    return (b.hasanatPoints || 0) - (a.hasanatPoints || 0); // Sort by highest
  }) || [];

  return (
    <Card className="border-indigo-200 bg-indigo-50/50 shadow-sm mt-6 mb-6">
      <CardHeader className="pb-3 border-b border-indigo-100/50">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-indigo-900">
              <Users className="h-5 w-5 text-indigo-600" /> 
              Friend Circles
            </CardTitle>
            <CardDescription className="text-indigo-700/70 mt-1 flex items-center gap-1">
              Connect anonymously to boost Ibadah 
              <Badge variant="outline" className="bg-white/50 text-indigo-500 border-indigo-200 text-[10px] uppercase ml-2">Beta</Badge>
            </CardDescription>
          </div>
          
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="h-8 gap-1 bg-white text-indigo-700 hover:bg-indigo-50 border-indigo-200" onClick={() => { setIsJoining(true); setIsCreating(false); }}>
              <UserPlus className="h-3.5 w-3.5" /> Join
            </Button>
            <Button size="sm" className="h-8 gap-1 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm" onClick={() => { setIsCreating(true); setIsJoining(false); }}>
              <Sparkles className="h-3.5 w-3.5" /> Create
            </Button>
          </div>
        </div>
        
        {/* Navigation Tabs */}
        {groups.length > 0 && !isCreating && !isJoining && (
          <div className="flex gap-2 mt-4 overflow-x-auto pb-1 invisible-scrollbar">
            {groups.map(g => (
              <button 
                key={g._id}
                onClick={() => setActiveGroup(g)}
                className={`px-3 py-1 text-xs font-semibold rounded-full whitespace-nowrap transition-colors ${activeGroup?._id === g._id ? 'bg-indigo-600 text-white shadow-sm' : 'bg-indigo-100/70 text-indigo-600 hover:bg-indigo-200/70'}`}
              >
                {g.name}
              </button>
            ))}
          </div>
        )}
      </CardHeader>

      <CardContent className="pt-4 pb-0">
        
        {/* Create Form */}
        {isCreating && (
          <div className="p-4 bg-white rounded-xl border border-indigo-100 shadow-sm space-y-3 mb-4">
            <h4 className="text-sm font-bold text-indigo-900">Create a New Circle</h4>
            <div className="flex gap-2">
              <Input placeholder="E.g., CSE '24 Halaqa" value={groupName} onChange={(e) => setGroupName(e.target.value)} className="bg-slate-50 border-indigo-100" />
              <Button disabled={loading} onClick={handleCreateGroup} className="bg-indigo-600 hover:bg-indigo-700">Create</Button>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setIsCreating(false)} className="text-slate-500 w-full">Cancel</Button>
          </div>
        )}

        {/* Join Form */}
        {isJoining && (
          <div className="p-4 bg-white rounded-xl border border-indigo-100 shadow-sm space-y-3 mb-4">
            <h4 className="text-sm font-bold text-indigo-900">Join a Circle</h4>
            <div className="flex gap-2">
              <Input placeholder="Enter 6-char code" value={inviteCode} onChange={(e) => setInviteCode(e.target.value)} className="bg-slate-50 border-indigo-100 uppercase" maxLength={6} />
              <Button disabled={loading} onClick={handleJoinGroup} className="bg-indigo-600 hover:bg-indigo-700">Join</Button>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setIsJoining(false)} className="text-slate-500 w-full">Cancel</Button>
          </div>
        )}

        {/* Empty State */}
        {groups.length === 0 && !isCreating && !isJoining && (
          <div className="py-8 text-center px-4">
            <div className="mx-auto w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-3">
              <Users className="h-6 w-6 text-indigo-400" />
            </div>
            <p className="text-sm text-indigo-900 font-semibold mb-1">No Friend Circles yet</p>
            <p className="text-xs text-indigo-600/70 max-w-62.5 mx-auto leading-relaxed">Create a circle and share the code with friends to track consistency together anonymously.</p>
          </div>
        )}

        {/* Active Group Dashboard */}
        {activeGroup && activeGroupDetails && !isCreating && !isJoining && (
          <div className="space-y-4 pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-white rounded-lg border border-indigo-100">
              <div className="flex items-center gap-2 mb-2 sm:mb-0">
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs">{activeGroup.name.charAt(0)}</div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">{activeGroupDetails.name}</h4>
                  <p className="text-[10px] text-slate-500">{activeGroupDetails.members.length} member(s)</p>
                </div>
              </div>
              <div 
                onClick={copyInviteCode}
                className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 cursor-pointer transition-colors rounded-md group"
              >
                <span className="text-xs font-semibold text-indigo-800 tracking-wider">CODE: <span className="font-mono text-indigo-600">{activeGroupDetails.inviteCode}</span></span>
                <Copy className="h-3 w-3 text-indigo-400 group-hover:text-indigo-600" />
              </div>
            </div>

            {/* Leaderboard */}
            <div className="bg-white rounded-xl border border-indigo-100/50 shadow-sm overflow-hidden">
              <div className="bg-indigo-50/50 px-4 py-2 border-b border-indigo-100">
                <h5 className="text-xs font-semibold text-indigo-800 uppercase tracking-wider flex items-center gap-1.5"><Trophy className="h-3.5 w-3.5 text-amber-500" /> Hasanat Leaderboard</h5>
              </div>
              <div className="divide-y divide-indigo-50">
                {sortedMembers.map((member, index) => {
                  const memberId = member._id || member.id;
                  const isMe = memberId === currentUserId;
                  const displayName = isMe ? "You" : (member.isAnonymous ? member.nickname : member.name);
                  
                  return (
                    <div key={member._id} className={`flex items-center justify-between p-3 ${isMe ? 'bg-indigo-50/30' : ''}`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${index === 0 ? 'bg-amber-100 text-amber-700' : index === 1 ? 'bg-slate-100 text-slate-600' : index === 2 ? 'bg-orange-100 text-orange-700' : 'bg-slate-50 text-slate-400'}`}>
                          {index + 1}
                        </div>
                        <div className="flex flex-col">
                          <span className={`text-sm font-medium ${isMe ? 'text-indigo-900 font-semibold' : 'text-slate-700'}`}>
                            {displayName}
                          </span>
                          <span className="text-[10px] text-slate-400">Streak: {member.streakDays} days</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-full">
                        <span className="text-xs font-bold text-amber-600">{member.hasanatPoints || 0}</span>
                        <span className="text-[10px] text-amber-500/70 uppercase">pts</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
          </div>
        )}
      </CardContent>
    </Card>
  );
}
