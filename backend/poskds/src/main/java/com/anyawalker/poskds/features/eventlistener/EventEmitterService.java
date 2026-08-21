package com.anyawalker.poskds.features.eventlistener;

import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

@Service
public class EventEmitterService <T>{
    //topic = roles, connections = emitters
    private final Map<String, List<SseEmitter>> channels = new ConcurrentHashMap<>();

    //clients subscribe the channel/topic
    public void subscribe(String topic, SseEmitter emitter){
        channels.computeIfAbsent(topic, k -> new CopyOnWriteArrayList<>()).add(emitter);
        emitter.onCompletion(() -> removeEmitter(topic, emitter));
        emitter.onTimeout(() -> removeEmitter(topic, emitter));
        emitter.onError(throwable -> removeEmitter(topic, emitter));
    }

    public void removeEmitter(String topic, SseEmitter emitter){
        channels.computeIfPresent(topic, (key, value) -> {
            value.remove(emitter);
            return value.isEmpty() ? null : value;
        });
    }

    public void closeConnections(String topic){
        channels.remove(topic);
    }

    @Async
    public void publish(String topic, String eventName, T data){
        List<SseEmitter> emitters = channels.get(topic);
        if (emitters == null || emitters.isEmpty())
            return;
        for (SseEmitter emitter : emitters){
            try{
                emitter.send(SseEmitter.event()
                        .name(eventName)
                        .data(data)
                );
            } catch (Exception e) {
                removeEmitter(topic, emitter);
            }
        }
    }
}
