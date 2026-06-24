package com.anyawalker.poskds.features.eventlistener;

import org.jspecify.annotations.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.async.DeferredResult;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

@Service
public class ListenerService<T> {
    //group listeners by user roles
    Map<String,List<DeferredResult<@NonNull T>>> listeners = new ConcurrentHashMap<>();

    //add the incoming request to wait
    public void register(String userRole,DeferredResult<@NonNull T>  listener){
        //register the incoming request with userId
        listeners.computeIfAbsent(userRole,k -> new CopyOnWriteArrayList<>()).add(listener);

        listener.onCompletion(() -> removeListener(userRole,listener));
        listener.onTimeout(() -> removeListener(userRole, listener));
        listener.onError(t -> removeListener(userRole, listener));
    }
    public void removeListener(String userRole,DeferredResult<@NonNull T> listener){
        listeners.computeIfPresent(userRole, (key,list) -> {
            list.remove(listener);
            return list.isEmpty() ? null : list;
        });
    }

    public void resolveListener(String userRole,T completedOrderResponse){
        Map<String, Set<String>> rules = Map.of(
                "ROLE_CASHIER", Set.of("ROLE_ADMIN", "ROLE_CHEF"),
                "ROLE_ADMIN", Set.of("ROLE_CHEF", "ROLE_CASHIER"),
                "ROLE_CHEF", Set.of("ROLE_CASHIER", "ROLE_ADMIN"));
        //.compute has the thread safe feature and easy to write but
        //null mean delete and returning the same value mean not delete from Map<>
        rules.get(userRole).forEach(r -> {
            listeners.computeIfPresent(r,(key,list)-> {
                for (DeferredResult<@NonNull T> awaitingListener : list){
                    awaitingListener.setResult(completedOrderResponse);
                }
                return null;
            });
        } );

    }
}
