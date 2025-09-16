'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Phone, 
  PhoneOff, 
  Monitor, 
  Camera, 
  Settings,
  Users,
  MessageSquare,
  FileText,
  Clock,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface VideoRoomProps {
  appointmentId: string;
  isDoctor: boolean;
  patientName?: string;
  doctorName?: string;
  onEndCall?: () => void;
}

interface QueueInfo {
  position: number;
  estimatedWaitTime: string;
  totalInQueue: number;
}

export default function VideoRoom({ 
  appointmentId, 
  isDoctor, 
  patientName, 
  doctorName,
  onEndCall 
}: VideoRoomProps) {
  // Video/Audio State
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [callStatus, setCallStatus] = useState<'connecting' | 'connected' | 'ended' | 'waiting'>('connecting');
  
  // Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingConsent, setRecordingConsent] = useState(false);
  const [showRecordingDialog, setShowRecordingDialog] = useState(false);
  
  // Queue State
  const [queueInfo, setQueueInfo] = useState<QueueInfo | null>(null);
  const [showQueue, setShowQueue] = useState(!isDoctor);
  
  // Connection State
  const [connectionQuality, setConnectionQuality] = useState<'good' | 'fair' | 'poor'>('good');
  const [participants, setParticipants] = useState<number>(1);
  
  // Chat/Notes
  const [showChat, setShowChat] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  
  // Refs
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localStream = useRef<MediaStream | null>(null);
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  
  // Timer for call duration
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (callStatus === 'connected') {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [callStatus]);

  // Initialize WebRTC
  const initializeWebRTC = useCallback(async () => {
    try {
      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      localStream.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      
      // Create peer connection
      peerConnection.current = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          // Add TURN servers for production
        ]
      });
      
      // Add local stream to peer connection
      stream.getTracks().forEach(track => {
        peerConnection.current?.addTrack(track, stream);
      });
      
      // Handle remote stream
      peerConnection.current.ontrack = (event) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
        setCallStatus('connected');
      };
      
      // Handle connection state changes
      peerConnection.current.onconnectionstatechange = () => {
        const state = peerConnection.current?.connectionState;
        if (state === 'connected') {
          setCallStatus('connected');
        } else if (state === 'failed' || state === 'disconnected') {
          setCallStatus('ended');
        }
      };
      
      // Monitor connection quality
      setInterval(() => {
        if (peerConnection.current) {
          peerConnection.current.getStats().then(stats => {
            // Analyze stats for connection quality
            // This is simplified - in production, you'd analyze packet loss, jitter, etc.
            setConnectionQuality('good');
          });
        }
      }, 5000);
      
    } catch (error) {
      console.error('Error initializing WebRTC:', error);
      setCallStatus('ended');
    }
  }, []);

  // Load queue information for patients
  const loadQueueInfo = useCallback(async () => {
    if (!isDoctor) {
      try {
        const response = await fetch(`/api/queue/${appointmentId}`);
        const data = await response.json();
        setQueueInfo(data);
      } catch (error) {
        console.error('Error loading queue info:', error);
      }
    }
  }, [appointmentId, isDoctor]);

  useEffect(() => {
    initializeWebRTC();
    loadQueueInfo();
    
    return () => {
      // Cleanup
      if (localStream.current) {
        localStream.current.getTracks().forEach(track => track.stop());
      }
      if (peerConnection.current) {
        peerConnection.current.close();
      }
    };
  }, [initializeWebRTC, loadQueueInfo]);

  const toggleVideo = () => {
    if (localStream.current) {
      const videoTrack = localStream.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  };

  const toggleAudio = () => {
    if (localStream.current) {
      const audioTrack = localStream.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  };

  const startScreenShare = async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
      });
      
      // Replace video track with screen share
      const videoTrack = screenStream.getVideoTracks()[0];
      const sender = peerConnection.current?.getSenders().find(
        s => s.track && s.track.kind === 'video'
      );
      
      if (sender) {
        await sender.replaceTrack(videoTrack);
        setIsScreenSharing(true);
      }
      
      videoTrack.onended = () => {
        setIsScreenSharing(false);
        // Switch back to camera
        if (localStream.current) {
          const cameraTrack = localStream.current.getVideoTracks()[0];
          if (sender && cameraTrack) {
            sender.replaceTrack(cameraTrack);
          }
        }
      };
    } catch (error) {
      console.error('Error starting screen share:', error);
    }
  };

  const startRecording = async () => {
    if (!recordingConsent) {
      setShowRecordingDialog(true);
      return;
    }
    
    // Implement recording logic here
    // In production, this would typically be handled server-side
    setIsRecording(true);
  };

  const endCall = () => {
    setCallStatus('ended');
    if (onEndCall) {
      onEndCall();
    }
  };

  const formatDuration = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getConnectionIndicator = () => {
    const colors = {
      good: 'bg-green-500',
      fair: 'bg-yellow-500',
      poor: 'bg-red-500'
    };
    
    return (
      <div className="flex items-center space-x-1">
        <div className={`w-2 h-2 rounded-full ${colors[connectionQuality]}`}></div>
        <span className="text-sm text-gray-600 capitalize">{connectionQuality}</span>
      </div>
    );
  };

  // Queue Display Component
  const QueueDisplay = () => (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <Clock className="w-5 h-5 mr-2" />
          Queue Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        {queueInfo ? (
          <div className="space-y-2">
            <div className="text-2xl font-bold text-blue-600">
              Position: {queueInfo.position}
            </div>
            <div className="text-gray-600">
              Estimated wait time: {queueInfo.estimatedWaitTime}
            </div>
            <div className="text-sm text-gray-500">
              {queueInfo.totalInQueue} patients in queue
            </div>
          </div>
        ) : (
          <div>Loading queue information...</div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      {/* Queue Display for Patients */}
      {showQueue && callStatus !== 'connected' && <QueueDisplay />}
      
      {/* Main Video Area */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Video Streams */}
        <div className="lg:col-span-2 space-y-4">
          {/* Remote Video (Main) */}
          <Card className="overflow-hidden">
            <div className="relative aspect-video bg-black">
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              
              {/* Connection Status Overlay */}
              <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white px-3 py-2 rounded-lg">
                <div className="flex items-center space-x-2">
                  {getConnectionIndicator()}
                  <span className="text-sm">
                    {isDoctor ? patientName : doctorName}
                  </span>
                </div>
              </div>
              
              {/* Call Duration */}
              {callStatus === 'connected' && (
                <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-3 py-2 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">{formatDuration(callDuration)}</span>
                  </div>
                </div>
              )}
              
              {/* Recording Indicator */}
              {isRecording && (
                <div className="absolute bottom-4 left-4 bg-red-600 text-white px-3 py-2 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-sm">Recording</span>
                  </div>
                </div>
              )}
            </div>
          </Card>
          
          {/* Local Video (Picture-in-Picture) */}
          <Card className="w-64 ml-auto">
            <div className="relative aspect-video bg-black">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                You {isScreenSharing && '(Screen)'}
              </div>
            </div>
          </Card>
        </div>
        
        {/* Sidebar */}
        <div className="space-y-4">
          {/* Call Controls */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Call Controls</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2 mb-4">
                <Button
                  variant={isVideoEnabled ? "default" : "destructive"}
                  onClick={toggleVideo}
                  className="w-full"
                >
                  {isVideoEnabled ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                </Button>
                
                <Button
                  variant={isAudioEnabled ? "default" : "destructive"}
                  onClick={toggleAudio}
                  className="w-full"
                >
                  {isAudioEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                </Button>
                
                <Button
                  variant={isScreenSharing ? "secondary" : "outline"}
                  onClick={startScreenShare}
                  className="w-full"
                >
                  <Monitor className="w-4 h-4" />
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => setShowChat(!showChat)}
                  className="w-full"
                >
                  <MessageSquare className="w-4 h-4" />
                </Button>
              </div>
              
              {/* Doctor-only controls */}
              {isDoctor && (
                <div className="space-y-2 mb-4">
                  <Button
                    variant={isRecording ? "destructive" : "outline"}
                    onClick={startRecording}
                    className="w-full"
                  >
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${isRecording ? 'bg-white' : 'bg-red-500'}`}></div>
                      <span>{isRecording ? 'Stop Recording' : 'Start Recording'}</span>
                    </div>
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => setShowNotes(!showNotes)}
                    className="w-full"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Notes
                  </Button>
                </div>
              )}
              
              <Button
                variant="destructive"
                onClick={endCall}
                className="w-full"
              >
                <PhoneOff className="w-4 h-4 mr-2" />
                End Call
              </Button>
            </CardContent>
          </Card>
          
          {/* Participants */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Users className="w-5 h-5 mr-2" />
                Participants ({participants})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm">
                    {isDoctor ? 'D' : 'P'}
                  </div>
                  <span>You</span>
                </div>
                {callStatus === 'connected' && (
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm">
                      {isDoctor ? 'P' : 'D'}
                    </div>
                    <span>{isDoctor ? patientName : doctorName}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Recording Consent Dialog */}
      {showRecordingDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-96">
            <CardHeader>
              <CardTitle>Recording Consent</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Do you consent to recording this consultation for medico-legal purposes? 
                The recording will be securely stored and only accessible to authorized healthcare providers.
              </p>
              <div className="flex space-x-2">
                <Button
                  onClick={() => {
                    setRecordingConsent(true);
                    setShowRecordingDialog(false);
                    startRecording();
                  }}
                  className="flex-1"
                >
                  I Consent
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowRecordingDialog(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}