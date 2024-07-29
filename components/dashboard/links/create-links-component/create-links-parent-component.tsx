"use client";

import { PlusCircle, MinusCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useReducer, Suspense } from "react";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { CreateLinksComponent } from "@/components/dashboard/links/create-links-component/create-link-component";

export enum STATE_ACTIONS {
  SET_ERROR = "SET_ERROR",
  CLEAR_ERROR = "CLEAR_ERROR",
  SET_URLS = "SET_URLS",
  CLEAR_URLS = "CLEAR_URLS",
  SET_CREATING = "SET_CREATING",
  CLEAR_CREATING = "CLEAR_CREATING",
  SET_TAGS = "SET_TAGS",
  RESET_STATE = "RESET_STATE",
}

type State = {
  error: string | null;
  long_url: string | null;
  short_url: string | null;
  is_creating_url: boolean;
};

type REDUCER_ACTION = {
  type: STATE_ACTIONS;
  payload?: Partial<State>;
};

const initialState: State = {
  error: null,
  long_url: null,
  short_url: null,
  is_creating_url: false,
};

function reducer(state: State, action: REDUCER_ACTION): State {
  const { type, payload } = action;

  switch (type) {
    case STATE_ACTIONS.SET_URLS:
      return {
        ...state,
        long_url: payload?.long_url || null,
        short_url: payload?.short_url || null,
      };
    case STATE_ACTIONS.CLEAR_URLS:
      return { ...state, long_url: null, short_url: null };
    case STATE_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: payload?.error || null,
        is_creating_url: false,
      };
    case STATE_ACTIONS.CLEAR_ERROR:
      return { ...state, error: null };
    case STATE_ACTIONS.SET_CREATING:
      return { ...state, is_creating_url: true };
    case STATE_ACTIONS.CLEAR_CREATING:
      return { ...state, is_creating_url: false };
    case STATE_ACTIONS.RESET_STATE:
      return initialState;
    default:
      return state;
  }
}

export default function CreateLinksParentComponent() {
  const [isOpen, setIsOpen] = useState(false);
  const [state, dispatch] = useReducer(reducer, initialState);

  const toggleCollapsible = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="w-full h-full pr-8 pt-8">
      <div className="flex justify-between items-center mb-8">
        <Button
          onClick={toggleCollapsible}
          className="font-semibold flex gap-2"
        >
          {!isOpen ? <PlusCircle /> : <MinusCircle />}
          <span>New Short link</span>
        </Button>
        {isOpen && (
          <Button
            className="rounded-full w-10 h-10 p-2"
            onClick={() => setIsOpen(false)}
          >
            <X />
          </Button>
        )}
      </div>
      <div className="mb-12">
        <Collapsible open={isOpen}>
          <CollapsibleContent>
            <CreateLinksComponent
              state={state}
              dispatch={dispatch}
              setIsOpen={setIsOpen}
              STATE_ACTIONS={STATE_ACTIONS}
            />
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );
}
